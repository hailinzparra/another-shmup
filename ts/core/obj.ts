interface CoreObjectManager {
    _ID: number
    names: string[]
    instances: CoreObject[][]
    add_name(name: string): number
    get_index(name: string): number
    update_all(): void
    render_all(): void
    /**
     * Push instance, give it unique id, and call `start`
     */
    instantiate<T>(name: string, instance: T): T
    take(...names: string[]): CoreObject[]
    get(id: number): CoreObject | null
    remove(id: number): CoreObject | null
    nearest(name: string, x: number, y: number): CoreObject | null
}

class CoreObject {
    x: number
    y: number
    id: number = 0
    depth: number = 0
    is_active: boolean = true
    is_visible: boolean = true
    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }
    start() { }
    pre_update() { }
    update() { }
    post_update() { }
    inactive_update() { }
    render() { }
}

core.obj = {
    _ID: 0,
    names: [],
    instances: [],
    add_name(name) {
        this.instances.push([])
        return this.names.push(name) - 1
    },
    get_index(name) {
        return this.names.indexOf(name)
    },
    update_all() {
        for (let i = this.instances.length - 1; i >= 0; i--) {
            for (let j = this.instances[i].length - 1; j >= 0; j--) {
                if (this.instances[i][j].is_active) {
                    this.instances[i][j].pre_update()
                    // Check if instance is not removed
                    if (this.instances[i][j]) this.instances[i][j].update()
                    if (this.instances[i][j]) this.instances[i][j].post_update()
                }
                else {
                    this.instances[i][j].inactive_update()
                }
            }
        }
    },
    render_all() {
        const h: CoreObject[] = []
        for (let i = this.instances.length - 1; i >= 0; i--) {
            for (let j = this.instances[i].length - 1; j >= 0; j--) {
                if (this.instances[i][j].is_visible) {
                    h.push(this.instances[i][j])
                }
            }
        }
        h.sort((a, b) => a.depth - b.depth)
        for (let i = h.length - 1; i >= 0; i--) {
            h[i].render()
        }
    },
    instantiate(name, n) {
        this.instances[this.get_index(name)].push((n as CoreObject));
        (n as CoreObject).id = this._ID++
        (n as CoreObject).start()
        return n
    },
    take(...names) {
        let h: CoreObject[] = []
        for (const name of names) {
            h = h.concat(this.instances[this.get_index(name)])
        }
        return h
    },
    get(id) {
        for (let i = this.instances.length - 1; i >= 0; i--) {
            for (let j = this.instances[i].length - 1; j >= 0; j--) {
                if (this.instances[i][j].id === id) {
                    return this.instances[i][j]
                }
            }
        }
        return null
    },
    remove(id) {
        for (let i = this.instances.length - 1; i >= 0; i--) {
            for (let j = this.instances[i].length - 1; j >= 0; j--) {
                if (this.instances[i][j].id === id) {
                    return this.instances[i].splice(j, 1)[0]
                }
            }
        }
        return null
    },
    nearest(name, x, y) {
        let l = -1
        let m = null
        for (const n of this.instances[this.get_index(name)]) {
            const o = Math.hypot(n.x - x, n.y - y)
            if (l < 0 || o < l) {
                m = n
                l = o
            }
        }
        return m
    },
}
