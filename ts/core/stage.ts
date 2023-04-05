interface CoreStage {
    pixel_ratio: number
    w: number
    h: number
    mid: {
        w: number
        h: number
    }
    /**
     * Set size by css, it will adjust, see `resize_event`
     */
    canvas: HTMLCanvasElement
    /**
     * Setup event handlers
     */
    setup(): void
    apply_pixel_ratio(): void
    resize_event(): void
    clear(): void
    get_random_x(margin?: number): number
    get_random_y(): number
}

core.stage = {
    pixel_ratio: 2,
    w: 300,
    h: 150,
    mid: {
        w: 150,
        h: 75,
    },
    canvas: document.createElement('canvas'),
    setup() {
        window.addEventListener('resize', () => this.resize_event())
    },
    apply_pixel_ratio() {
        const ctx = this.canvas.getContext('2d')!
        const redraw_canvas = document.createElement('canvas')
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            redraw_canvas.width = this.canvas.width
            redraw_canvas.height = this.canvas.height
            redraw_canvas.getContext('2d')!.drawImage(this.canvas, 0, 0)
        }
        this.canvas.width = this.w * this.pixel_ratio
        this.canvas.height = this.h * this.pixel_ratio
        ctx.resetTransform()
        ctx.drawImage(redraw_canvas, 0, 0)
        ctx.scale(this.pixel_ratio, this.pixel_ratio)
    },
    resize_event() {
        const b = this.canvas.getBoundingClientRect()
        this.w = b.width
        this.h = b.height
        this.mid.w = this.w / 2
        this.mid.h = this.h / 2
        this.apply_pixel_ratio()
    },
    clear() {
        this.canvas.getContext('2d')!.clearRect(0, 0, this.w, this.h)
    },
    get_random_x(margin = 0) {
        return margin + (this.w - margin * 2) * Math.random()
    },
    get_random_y() {
        return this.h * Math.random()
    },
}
