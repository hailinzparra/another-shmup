interface CoreLoader {
    _is_loaded: boolean
    load_amount: number
    loaded_count: number
    get_is_loaded(): boolean
    get_load_progress(): number
    set_image_load_event(img: HTMLImageElement): void
    load_image(origin: CoreVec2, name: string, src: string): void
    load_strip(origin: CoreVec2, name: string, src: string, image_number: number, image_per_row?: number): void
}

core.loader = {
    _is_loaded: false,
    load_amount: 0,
    loaded_count: 0,
    get_is_loaded() {
        return this._is_loaded ? true : this.loaded_count === this.load_amount
    },
    get_load_progress() {
        return this.load_amount < 1 ? 1 : this.loaded_count / this.load_amount
    },
    set_image_load_event(img) {
        this.load_amount++
        img.addEventListener('load', () => {
            this.loaded_count++
            if (this.loaded_count >= this.load_amount) {
                this._is_loaded = true
            }
        })
    },
    load_image(origin, name, src) {
        const img = new Image()
        img.src = src
        core.draw.add_image(origin, name, img)
        this.set_image_load_event(img)
    },
    load_strip(origin, name, src, image_number, image_per_row = 0) {
        image_per_row = image_per_row || image_number
        const img = new Image()
        img.src = src
        core.draw.add_strip(origin, name, img, image_number, image_per_row)
        this.set_image_load_event(img)
    },
}
