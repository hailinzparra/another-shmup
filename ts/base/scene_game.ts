class Alarm {
    tick: number
    default_interval: number
    callbacks: Function[] = []
    constructor(default_interval: number, is_auto_start: boolean = true) {
        this.tick = -1
        this.default_interval = default_interval
        if (is_auto_start) {
            this.tick = this.default_interval
        }
    }
    on_alarm(callback: Function) {
        this.callbacks.push(callback)
    }
    restart() {
        this.tick = this.default_interval
    }
    update() {
        if (this.tick < 0 && this.tick !== -1) {
            for (let i = 0; i < this.callbacks.length; i++) {
                this.callbacks[i].call(this)
            }
            this.tick = -1
        }
        else {
            this.tick -= time.dt
        }
    }
}

class Ship extends CoreObject {
    image_index: number
    is_controllable: boolean = false
    is_active_shooter: boolean = false
    is_shooting: boolean = false
    shooting_alarm: Alarm = new Alarm(150)
    bullet_speed: number = 8
    constructor(x: number, y: number, image_index: number, is_player?: boolean) {
        super(x, y)
        this.depth = -1
        this.image_index = image_index
        if (is_player) {
            this.is_controllable = true
            this.is_active_shooter = true
        }
        this.shooting_alarm.on_alarm(() => {
            this.is_shooting = false
        })
    }
    pre_update(): void {
        this.shooting_alarm.update()
    }
    update(): void {
        if (this.is_controllable) {
            const next_pos = new CoreVec2(this.x, this.y)
            next_pos.lerp_to(new CoreVec2(input.x, input.y))
            this.x = next_pos.x
            this.y = next_pos.y
        }
        if (this.is_active_shooter) {
            if (input.mouse_hold(0)) {
                if (!this.is_shooting) {
                    console.log('shoot')
                    this.shoot()
                }
            }
        }
    }
    shoot() {
        obj.instantiate('bullet', new Bullet(this.x, this.y, this.bullet_speed, -90))

        this.is_shooting = true
        this.shooting_alarm.restart()
    }
    render(): void {
        draw.strip_transformed('ships', this.image_index, this.x, this.y, 2, 2, 0)
    }
}

obj.add_name('ship')

class Bullet extends CoreObject {
    speed: number
    angle_deg: number
    constructor(x: number, y: number, speed: number, angle_deg: number) {
        super(x, y)
        this.speed = speed
        this.angle_deg = angle_deg
    }
    update(): void {
        const a = this.angle_deg * draw.DEG_TO_RAD
        this.x += this.speed * Math.cos(a) * time.scaled_dt
        this.y += this.speed * Math.sin(a) * time.scaled_dt
        if (this.is_outside_stage()) {
            obj.remove(this.id)
        }
    }
    is_outside_stage() {
        return this.x < 32 || this.x > stage.w + 32 || this.y < 32 || this.y > stage.h + 32
    }
    render(): void {
        draw.strip_transformed('tiles', 0, this.x, this.y, 2, 2, this.angle_deg - 90)
    }
}

obj.add_name('bullet')

let player_ship: Ship | null = null

const scene_game = new CoreScene()

scene_game.start = () => {
    player_ship = obj.instantiate('ship', new Ship(stage.mid.w, stage.mid.h, 1, true))
}

scene_game.update = () => {
}

scene_game.render = () => {
    const tile_scale = 3
    const tile_size = 16 * tile_scale
    const tile_vertical_move = Math.floor(time.t / 10) % tile_size
    for (let i = stage.w / tile_size; i >= 0; i--) {
        for (let j = stage.h / tile_size; j >= -1; j--) {
            draw.strip_transformed('tiles', 50, i * tile_size, j * tile_size + tile_vertical_move, tile_scale, tile_scale, 0)
        }
    }
}

scene_game.render_ui = () => {
}
