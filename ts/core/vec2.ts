class CoreVec2 {
    x: number
    y: number
    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }
    set(x: number | CoreVec2, y?: number) {
        if (x instanceof CoreVec2) {
            y = x.y
            x = x.x
        }
        this.x = x
        this.y = (typeof y === 'undefined' ? this.y : y)
        return this
    }
    add(x: number | CoreVec2, y?: number) {
        if (x instanceof CoreVec2) {
            y = x.y
            x = x.x
        }
        this.x += x
        this.y += (typeof y === 'undefined' ? this.y : y)
        return this
    }
    reset() {
        this.set(0, 0)
    }
    lerp_to(target: CoreVec2, t: number = 0.1) {
        this.x += (target.x - this.x) * t
        this.y += (target.y - this.y) * t
    }
    static one: CoreVec2 = new CoreVec2(1, 1)
    static zero: CoreVec2 = new CoreVec2(0, 0)
    static half: CoreVec2 = new CoreVec2(0.5, 0.5)
}
