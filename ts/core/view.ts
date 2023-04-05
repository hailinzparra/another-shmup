class CoreView extends CoreObject {
    position: CoreVec2 = new CoreVec2()
    target_position: CoreVec2 = new CoreVec2()
    is_shaking: boolean = false
    shake_timer: number = 0
    shake_duration: number = 1000
    shake_strength: number = 2
    shake_offset: CoreVec2 = new CoreVec2()
    offset_position: CoreVec2 = new CoreVec2()
    constructor() {
        super(0, 0)
    }
    set_target_position(v: CoreVec2) {
        this.target_position.set(v)
    }
    update() {
        this.position.lerp_to(this.target_position, 0.2 * time.scaled_dt)
        if (this.is_shaking) {
            if (this.shake_timer <= 0) {
                this.is_shaking = false
                this.shake_offset.reset()
            }
            else {
                this.shake_timer -= time.dt
                const shake_timer_scalar = this.shake_timer / this.shake_duration
                const strength = this.shake_strength * shake_timer_scalar
                this.shake_offset.x = strength * (-1 + 2 * Math.random())
                this.shake_offset.y = strength * (-1 + 2 * Math.random())
            }
            this.offset_position.set(this.position).add(this.shake_offset)
        }
    }
    post_update() {
        this.x = this.position.x
        this.y = this.position.y
    }
    shake(duration: number, strength: number) {
        this.shake_duration = duration
        this.shake_strength = strength
        this.shake_timer = this.shake_duration
        this.is_shaking = true
    }
    static instantiate_view() {
        return core.obj.instantiate('core_view', new CoreView())
    }
}

core.obj.add_name('core_view')
