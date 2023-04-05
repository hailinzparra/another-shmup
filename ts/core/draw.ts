interface CoreDraw {
    TWO_PI: number
    DEG_TO_RAD: number
    RAD_TO_DEG: number
    ctx: CanvasRenderingContext2D
    text_height: number
    images: { [name: string]: { origin: CoreVec2, image: HTMLImageElement } }
    strips: {
        [name: string]: {
            origin: CoreVec2,
            image: HTMLImageElement,
            image_number: number,
            image_per_row: number,
            image_width: number,
            image_height: number,
        }
    }
    set_color(fill: string, stroke?: string): void
    set_font(font: CoreFont, overrides?: {
        size?: CoreFont['size']
        style?: CoreFont['style']
        family?: CoreFont['family']
    }): void
    set_halign(align: CanvasTextAlign): void
    set_valign(align: CanvasTextBaseline): void
    set_hvalign(halign: CanvasTextAlign, valign: CanvasTextBaseline): void
    split_text(text: string): string[]
    text(x: number, y: number, text: string): void
    get_text_width(text: string): number
    get_text_height(text: string): number
    add_image(origin: CoreVec2, name: string, image: HTMLImageElement): HTMLImageElement
    add_strip(origin: CoreVec2, name: string, image: HTMLImageElement, image_number: number, image_per_row?: number): HTMLImageElement
    set_alpha(a: number): void
    reset_alpha(): void
    /**
     * Draw image element
     */
    image_el(image: HTMLImageElement, x: number, y: number, origin?: CoreVec2): void
    /**
     * Draw image from storage
     */
    image(name: string, x: number, y: number): void
    strip(name: string, image_index: number, x: number, y: number): void
    draw(is_stroke?: boolean): void
    line(x1: number, y1: number, x2: number, y2: number): void
    rect(x: number, y: number, w: number, h: number, is_stroke?: boolean): void
    circle(x: number, y: number, r: number, is_stroke?: boolean): void
    on_transform(x: number, y: number, xscale: number, yscale: number, angle_deg: number, draw_fn: Function): void
    image_transformed(name: string, x: number, y: number, xscale: number, yscale: number, angle_deg: number): void
    image_rotated(name: string, x: number, y: number, angle_deg: number): void
    image_ext(name: string, x: number, y: number, xscale: number, yscale: number, angle_deg: number, alpha: number): void // to add: blend mode
    strip_transformed(name: string, image_index: number, x: number, y: number, xscale: number, yscale: number, angle_deg: number): void
    strip_rotated(name: string, image_index: number, x: number, y: number, angle_deg: number): void
    strip_ext(name: string, image_index: number, x: number, y: number, xscale: number, yscale: number, angle_deg: number, alpha: number): void
}

core.draw = {
    TWO_PI: 2 * Math.PI,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    ctx: core.stage.canvas.getContext('2d')!,
    text_height: 10,
    images: {},
    strips: {},
    set_color(fill, stroke) {
        this.ctx.fillStyle = fill
        this.ctx.strokeStyle = stroke || fill
    },
    set_font(font, overrides = {}) {
        const style = (typeof overrides.style === 'undefined' ? font.style : overrides.style)
        this.ctx.font = `${style}${style ? ' ' : ''}${overrides.size || font.size}px ${overrides.family || font.family}, serif`
        this.text_height = overrides.size || font.size
    },
    set_halign(align) {
        this.ctx.textAlign = align
    },
    set_valign(align) {
        this.ctx.textBaseline = align
    },
    set_hvalign(halign, valign) {
        this.ctx.textAlign = halign
        this.ctx.textBaseline = valign
    },
    split_text(text) {
        return ('' + text).split('\n')
    },
    text(x, y, text) {
        let baseline = 0
        const t = this.split_text(text)
        switch (this.ctx.textBaseline) {
            case 'bottom':
                baseline = -this.text_height * (t.length - 1)
                break
            case 'middle':
                baseline = -this.text_height * (t.length - 1) * 0.5
                break
        }
        for (let i = t.length - 1; i >= 0; --i) {
            this.ctx.fillText(t[i], x, y + baseline + this.text_height * i)
        }
    },
    get_text_width(text) {
        return Math.max(...this.split_text(text).map(x => this.ctx.measureText(x).width))
    },
    get_text_height(text) {
        return this.text_height * this.split_text(text).length
    },
    add_image(origin, name, image) {
        this.images[name] = {
            origin,
            image,
        }
        return this.images[name].image
    },
    add_strip(origin, name, image, image_number, image_per_row) {
        image_per_row = image_per_row || image_number
        const image_width = image.width / image_per_row
        const image_height = image.height / (image_number / image_per_row)
        this.strips[name] = {
            origin,
            image,
            image_number,
            image_per_row,
            image_width,
            image_height,
        }
        return this.strips[name].image
    },
    set_alpha(a) {
        this.ctx.globalAlpha = a
    },
    reset_alpha() {
        this.ctx.globalAlpha = 1
    },
    image_el(img, x, y, origin = CoreVec2.half) {
        x -= img.width * origin.x
        y -= img.height * origin.y
        this.ctx.drawImage(img, x, y)
    },
    image(name, x, y) {
        const img = this.images[name]
        this.image_el(img.image, x, y, img.origin)
    },
    strip(name, image_index, x, y) {
        const img = this.strips[name]
        image_index = image_index % img.image_number
        x -= img.image_width * img.origin.x
        y -= img.image_height * img.origin.y
        this.ctx.drawImage(
            img.image,
            (image_index % img.image_per_row) * img.image_width,
            Math.floor(image_index / img.image_per_row) * img.image_height,
            img.image_width, img.image_height, x, y, img.image_width, img.image_height
        )
    },
    draw(is_stroke = false) {
        is_stroke ? this.ctx.stroke() : this.ctx.fill()
    },
    line(x1, y1, x2, y2) {
        this.ctx.beginPath()
        this.ctx.moveTo(x1, y1)
        this.ctx.lineTo(x2, y2)
        this.ctx.closePath()
        this.ctx.stroke()
    },
    rect(x, y, w, h, is_stroke = false) {
        this.ctx.beginPath()
        this.ctx.rect(x, y, w, h)
        this.draw(is_stroke)
    },
    circle(x, y, r, is_stroke = false) {
        this.ctx.beginPath()
        this.ctx.arc(x, y, r, 0, this.TWO_PI)
        this.draw(is_stroke)
    },
    on_transform(x, y, xscale, yscale, angle_deg, draw_fn) {
        this.ctx.save()
        this.ctx.translate(x, y)
        this.ctx.rotate(angle_deg * this.DEG_TO_RAD)
        this.ctx.scale(xscale, yscale)
        draw_fn()
        this.ctx.restore()
    },
    image_transformed(name, x, y, xscale, yscale, angle_deg) {
        this.on_transform(x, y, xscale, yscale, angle_deg, () => this.image(name, 0, 0))
    },
    image_rotated(name, x, y, angle_deg) {
        this.image_transformed(name, x, y, 1, 1, angle_deg)
    },
    image_ext(name, x, y, xscale, yscale, angle_deg, alpha) {
        this.set_alpha(alpha)
        this.image_transformed(name, x, y, xscale, yscale, angle_deg)
        this.reset_alpha()
    },
    strip_transformed(name, image_index, x, y, xscale, yscale, angle_deg) {
        this.on_transform(x, y, xscale, yscale, angle_deg, () => this.strip(name, image_index, 0, 0))
    },
    strip_rotated(name, image_index, x, y, angle_deg) {
        this.strip_transformed(name, image_index, x, y, 1, 1, angle_deg)
    },
    strip_ext(name, image_index, x, y, xscale, yscale, angle_deg, alpha) {
        this.set_alpha(alpha)
        this.strip_transformed(name, image_index, x, y, xscale, yscale, angle_deg)
        this.reset_alpha()
    },
}
