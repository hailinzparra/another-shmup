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

class MyObject extends CoreObject {
    circle_mask_r: number = 0
    constructor(x: number, y: number) {
        super(x, y)
    }
    intersect_circle(x: number, y: number, r: number) {
        return Math.hypot(this.x - x, this.y - y) < this.circle_mask_r + r
    }
}

class Ship extends MyObject {
    image_index: number
    is_controllable: boolean = false
    is_active_shooter: boolean = false
    is_shooting: boolean = false
    shooting_alarm: Alarm = new Alarm(150)
    bullet_speed: number = 8
    is_player: boolean = false
    shoot_pattern: number = 0
    speed: number
    direction_deg: number
    constructor(x: number, y: number, image_index: number, speed: number, direction_deg: number, is_player: boolean = false) {
        super(x, y)
        this.depth = -1
        this.image_index = image_index
        this.circle_mask_r = draw.strips['ships'].image_width / 2
        this.speed = speed
        this.direction_deg = direction_deg
        this.is_player = is_player
        if (this.is_player) {
            this.is_controllable = true
            this.is_active_shooter = true
        }
        this.shooting_alarm.on_alarm(() => {
            this.is_shooting = false
        })
    }
    pre_update(): void {
        this.shooting_alarm.update()
        const a = this.direction_deg * draw.DEG_TO_RAD
        this.x += this.speed * Math.cos(a) * time.scaled_dt
        this.y += this.speed * Math.sin(a) * time.scaled_dt
    }
    update(): void {
        if (this.is_player) {
            if (this.is_controllable) {
                const next_pos = new CoreVec2(this.x, this.y)
                next_pos.lerp_to(new CoreVec2(input.x, input.y))
                this.x = next_pos.x
                this.y = next_pos.y
            }
            if (this.is_active_shooter) {
                if (input.mouse_hold(0)) {
                    if (!this.is_shooting) {
                        this.shoot()
                    }
                }
            }
        }
        else {
            if (this.is_active_shooter) {
                if (!this.is_shooting) {
                    this.shoot()
                }
            }
        }
    }
    post_update(): void {
        for (const bullet of (obj.take('bullet') as Bullet[])) {
            if (bullet.owner_id !== this.id) {
                if (this.intersect_circle(bullet.x, bullet.y, bullet.circle_mask_r)) {
                    obj.remove(bullet.id)
                    obj.remove(this.id)
                }
            }
        }
    }
    spawn_bullet(speed: number, direction_deg: number) {
        return obj.instantiate('bullet', new Bullet(this.id, this.x, this.y, speed, direction_deg))
    }
    shoot() {
        switch (this.shoot_pattern) {
            default:
                this.spawn_bullet(this.bullet_speed, this.direction_deg)
                break
        }

        this.is_shooting = true
        this.shooting_alarm.restart()
    }
    render(): void {
        draw.strip_transformed('ships', this.image_index, this.x, this.y, 2, 2, this.direction_deg + 90)
    }
}

obj.add_name('ship')

class Bullet extends MyObject {
    owner_id: number
    speed: number
    angle_deg: number
    constructor(owner_id: number, x: number, y: number, speed: number, angle_deg: number) {
        super(x, y)
        this.circle_mask_r = 16
        this.owner_id = owner_id
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
        draw.strip_transformed('tiles', 0, this.x, this.y, 2, 2, this.angle_deg + 90)
        // draw.set_alpha(0.8)
        // draw.set_color('magenta')
        // draw.circle(this.x, this.y, this.circle_mask_r)
        // draw.set_alpha(1)
    }
}

obj.add_name('bullet')

let player_ship: Ship | null = null
let game_wave = 0
const spawners = [
    {
        time_to_spawn: 1000,
        is_spawned: false,
        spawn() {
            obj.instantiate('ship', new Ship(stage.get_random_x(64), -40, 4, 3, 90))
        }
    },
    // {
    //     time_to_spawn: 4000,
    //     is_spawned: false,
    //     spawn() {
    //         for (let i = 1; i <= 3; i++) {
    //             obj.instantiate('ship', new Ship(i * stage.w / 4, -40, 4, 3, 90))
    //         }
    //     }
    // }
]

const scene_game = new CoreScene()

scene_game.start = () => {
    player_ship = obj.instantiate('ship', new Ship(stage.mid.w, stage.mid.h, 1, 0, -90, true))
}

scene_game.update = () => {
    for (const s of spawners) {
        if (!s.is_spawned && time.t > s.time_to_spawn) {
            s.spawn()
            // s.is_spawned = true
            s.time_to_spawn = time.t + 500
        }
    }
}

scene_game.render = () => {
    const tile_scale = 3
    const tile_size = 16 * tile_scale
    const tile_vertical_move = Math.floor(time.t / 10) % tile_size
    for (let i = stage.w / tile_size; i >= 0; i--) {
        for (let j = stage.h / tile_size; j >= -1; j--) {
            draw.strip_transformed('tiles', 56, i * tile_size, j * tile_size + tile_vertical_move, tile_scale, tile_scale, 0)
        }
    }
}

scene_game.render_ui = () => {
}
