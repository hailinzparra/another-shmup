class CoreParticle {
    x: number
    y: number
    life: number
    speed: number = 0
    speed_inc: number = 0
    direction_rad: number = 0
    direction_rad_inc: number = 0
    size: number = 0
    /**
     * Scalar value
     */
    size_end: number = 0
    color: string = ''
    fade_out: number = 0
    vx: number = 0
    vy: number = 0
    grav: number = 0.5
    fric: number = 0.99
    life_start: number = 0
    life_scaled: number = 1
    constructor(x: number, y: number, life: number) {
        this.x = x
        this.y = y
        this.life = life
        this.life_start = this.life
    }
    update() {
        this.life -= time.dt
        this.life_scaled = Math.min(1, Math.max(0, this.life / this.life_start))
        if (this.life <= 0) {
            return false
        }
        this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        this.direction_rad = Math.atan2(this.vy, this.vx)
        this.speed += this.speed_inc * time.scaled_dt
        this.direction_rad += this.direction_rad_inc * time.scaled_dt
        this.vx = Math.cos(this.direction_rad) * this.speed
        this.vy = Math.sin(this.direction_rad) * this.speed
        this.vy += this.grav * time.scaled_dt
        this.vx *= this.fric
        this.vy *= this.fric
        this.x += this.vx * time.scaled_dt
        this.y += this.vy * time.scaled_dt
        return true
    }
    render() {
        draw.set_color(this.color)
        draw.ctx.globalAlpha = this.fade_out === 0 ? 1 : Math.min(1, this.life / this.fade_out)
        draw.circle(this.x, this.y, this.size * 0.5 * (1 - (1 - this.size_end) * (1 - this.life_scaled)))
        draw.ctx.globalAlpha = 1
    }
}

class CoreEmitter extends CoreObject {
    list: CoreParticle[] = []
    life: { min: number, max: number }
    area: { x: number, y: number, w: number, h: number }
    grav: { min: number, max: number }
    /**
     * 0 = no velocity, 1 = no friction
     */
    fric: { min: number, max: number }
    speed: { min: number, max: number }
    speed_inc: { min: number, max: number }
    direction_rad: { min: number, max: number }
    direction_rad_inc: { min: number, max: number }
    size: { min: number, max: number }
    size_end: { min: number, max: number }
    /**
     * Will be choosed randomly
     */
    colors: string[]
    /**
     * Start of fade out ranged 0-1 (0.5 = fade out at half of life, 0 = no fade out)
     */
    fade_out: { min: number, max: number }
    constructor() {
        super(0, 0)
        this.life = {
            min: 2000,
            max: 3000,
        }
        this.area = {
            x: 0,
            y: 0,
            w: 300,
            h: 0,
        }
        this.grav = {
            min: 0.5,
            max: 0.5,
        }
        this.fric = {
            min: 0.99,
            max: 0.99,
        }
        this.speed = {
            min: 15,
            max: 18,
        }
        this.speed_inc = {
            min: -0.5,
            max: 0.5,
        }
        this.direction_rad = {
            min: 0,
            max: Math.PI,
        }
        this.direction_rad_inc = {
            min: -0.1,
            max: 0.1,
        }
        this.size = {
            min: 10,
            max: 25,
        }
        this.size_end = {
            min: 0.1,
            max: 0.2,
        }
        this.colors = ['skyblue', 'royalblue', 'gold']
        this.fade_out = {
            min: 0.2,
            max: 0.4,
        }
    }
    static DEG_TO_RAD: number = Math.PI / 180
    static range(min: number, max: number): number {
        return min + Math.random() * (max - min)
    }
    reset(
        life_min: number = 1000, life_max: number = 1000,
        grav_min: number = 0, grav_max: number = 0,
        fric_min: number = 1, fric_max: number = 1,
        speed_min: number = 10, speed_max: number = 10,
        speed_inc_min: number = 10, speed_inc_max: number = 10,
        direction_deg_min: number = 0, direction_deg_max: number = 0,
        direction_deg_inc_min: number = 0, direction_deg_inc_max: number = 0,
        size_min: number = 20, size_max: number = 20,
        size_end_min: number = 0.1, size_end_max: number = 0.1,
        colors: string[] = ['white'],
        fade_out_min: number = 0.5, fade_out_max: number = 0.5,
    ) {
        this.set_life(life_min, life_max)
        this.set_grav(grav_min, grav_max)
        this.set_fric(fric_min, fric_max)
        this.set_speed(speed_min, speed_max)
        this.set_speed_inc(speed_inc_min, speed_inc_max)
        this.set_direction_deg(direction_deg_min, direction_deg_max)
        this.set_direction_deg_inc(direction_deg_inc_min, direction_deg_inc_max)
        this.set_size(size_min, size_max)
        this.set_size_end(size_end_min, size_end_max)
        this.colors = colors
        this.set_fade_out(fade_out_min, fade_out_max)
    }
    emit(min: number, max?: number) {
        let n = Math.round(CoreEmitter.range(min, (typeof max === 'undefined' ? min : max)))
        while (n-- > 0) {
            const p = new CoreParticle(
                CoreEmitter.range(this.area.x, this.area.x + this.area.w),
                CoreEmitter.range(this.area.y, this.area.y + this.area.h),
                CoreEmitter.range(this.life.min, this.life.max)
            )
            p.speed = CoreEmitter.range(this.speed.min, this.speed.max)
            p.speed_inc = CoreEmitter.range(this.speed_inc.min, this.speed_inc.max)
            p.direction_rad = CoreEmitter.range(this.direction_rad.min, this.direction_rad.max)
            p.direction_rad_inc = CoreEmitter.range(this.direction_rad_inc.min, this.direction_rad_inc.max)
            p.size = CoreEmitter.range(this.size.min, this.size.max)
            p.size_end = CoreEmitter.range(this.size_end.min, this.size_end.max)
            p.color = this.colors[Math.floor(Math.random() * this.colors.length)]
            p.fade_out = CoreEmitter.range(this.fade_out.min, this.fade_out.max)
            p.vx = Math.cos(p.direction_rad) * p.speed
            p.vy = Math.sin(p.direction_rad) * p.speed
            p.grav = CoreEmitter.range(this.grav.min, this.grav.max)
            p.fric = CoreEmitter.range(this.fric.min, this.fric.max)
            this.list.push(p)
        }
    }
    update() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            if (!this.list[i].update()) this.list.splice(i, 1)
        }
    }
    render() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.list[i].render()
        }
    }
    set_life(min: number, max?: number) {
        this.life.min = min
        this.life.max = (typeof max === 'undefined' ? min : max)
    }
    set_area(x: number, y: number, w: number = 0, h: number = 0) {
        this.area.x = x
        this.area.y = y
        this.area.w = w
        this.area.h = h
    }
    set_grav(min: number, max?: number) {
        this.grav.min = min
        this.grav.max = (typeof max === 'undefined' ? min : max)
    }
    set_fric(min: number, max?: number) {
        this.fric.min = min
        this.fric.max = (typeof max === 'undefined' ? min : max)
    }
    set_speed(min: number, max?: number) {
        this.speed.min = min
        this.speed.max = (typeof max === 'undefined' ? min : max)
    }
    set_speed_inc(min: number, max?: number) {
        this.speed_inc.min = min
        this.speed_inc.max = (typeof max === 'undefined' ? min : max)
    }
    set_direction_rad(min: number, max?: number) {
        this.direction_rad.min = min
        this.direction_rad.max = (typeof max === 'undefined' ? min : max)
    }
    set_direction_rad_inc(min: number, max?: number) {
        this.direction_rad_inc.min = min
        this.direction_rad_inc.max = (typeof max === 'undefined' ? min : max)
    }
    set_direction_deg(min: number, max?: number) {
        this.direction_rad.min = min * CoreEmitter.DEG_TO_RAD
        this.direction_rad.max = (typeof max === 'undefined' ? min : max) * CoreEmitter.DEG_TO_RAD
    }
    set_direction_deg_inc(min: number, max?: number) {
        this.direction_rad_inc.min = min * CoreEmitter.DEG_TO_RAD
        this.direction_rad_inc.max = (typeof max === 'undefined' ? min : max) * CoreEmitter.DEG_TO_RAD
    }
    set_size(min: number, max?: number) {
        this.size.min = min
        this.size.max = (typeof max === 'undefined' ? min : max)
    }
    set_size_end(min: number, max?: number) {
        this.size_end.min = min
        this.size_end.max = (typeof max === 'undefined' ? min : max)
    }
    set_colors(...colors: string[]) {
        this.colors = colors
    }
    set_fade_out(min: number, max?: number) {
        this.fade_out.min = min
        this.fade_out.max = (typeof max === 'undefined' ? min : max)
    }
    static instantiate_emitter() {
        return core.obj.instantiate('core_emitter', new CoreEmitter())
    }
}

core.obj.add_name('core_emitter')
