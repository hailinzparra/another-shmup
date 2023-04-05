interface CoreInput {
    /**
     * In ms
     */
    DEFAULT_MOVING_TIMEOUT: number
    x: number
    y: number
    mouse_x: number
    mouse_y: number
    position: {
        x: number
        y: number
    }
    /**
     * In ms
     */
    is_moving_timeout_done: boolean,
    is_mouse_moving: boolean
    mouses: CoreInputKey[]
    setup(): void
    set_position(x: number, y: number): void
    set_mouse_position(x: number, y: number): void
    update_mouse(e: MouseEvent): void
    mouse_up(button: number): boolean
    mouse_down(button: number): boolean
    mouse_hold(button: number): boolean
    reset(): void
}

class CoreInputKey {
    id: string | number
    is_held: boolean = false
    is_pressed: boolean = false
    is_released: boolean = false
    constructor(id: CoreInputKey['id']) {
        this.id = id
    }
    up() {
        this.is_held = false
        this.is_released = true
    }
    down() {
        if (!this.is_held) {
            this.is_held = true
            this.is_pressed = true
        }
    }
    /**
     * Call every frame to make sure `is_pressed` and `is_released` only true in one frame
     */
    reset() {
        this.is_pressed = false
        this.is_released = false
    }
}

core.input = {
    DEFAULT_MOVING_TIMEOUT: 100,
    x: 0,
    y: 0,
    mouse_x: 0,
    mouse_y: 0,
    position: {
        x: 0,
        y: 0,
    },
    is_moving_timeout_done: true,
    is_mouse_moving: false,
    mouses: [],
    setup() {
        // Create inputs
        for (let i = 0; i < 5; i++) {
            this.mouses.push(new CoreInputKey(i))
        }

        // Setup events
        window.addEventListener('mouseup', e => {
            this.mouses[(e as MouseEvent).button].up()
            this.update_mouse((e as MouseEvent))
        })

        window.addEventListener('mousedown', e => {
            this.mouses[(e as MouseEvent).button].down()
            this.update_mouse((e as MouseEvent))
        })

        window.addEventListener('mousemove', e => {
            this.update_mouse((e as MouseEvent))
            this.is_moving_timeout_done = false
            this.is_mouse_moving = true
            window.setTimeout(() => this.is_moving_timeout_done = true, this.DEFAULT_MOVING_TIMEOUT)
        })
    },
    set_position(x, y) {
        this.x = x
        this.y = y
        this.position.x = this.x
        this.position.y = this.y
    },
    set_mouse_position(x, y) {
        this.mouse_x = x
        this.mouse_y = y
        this.set_position(this.mouse_x, this.mouse_y)
    },
    update_mouse(e) {
        const b = core.stage.canvas.getBoundingClientRect()
        this.set_mouse_position(e.clientX - b.x, e.clientY - b.y)
    },
    mouse_up(button) {
        return this.mouses[button].is_released
    },
    mouse_down(button) {
        return this.mouses[button].is_pressed
    },
    mouse_hold(button) {
        return this.mouses[button].is_held
    },
    reset() {
        this.mouses.forEach(n => n.reset())
        if (this.is_moving_timeout_done) {
            this.is_mouse_moving = false
        }
    },
}
