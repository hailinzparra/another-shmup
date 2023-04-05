interface CoreTime {
    t: number
    dt: number
    last_time: number
    fps: number
    scaled_dt: number
    update(t: number): void
}

core.time = {
    t: 0,
    dt: 0,
    last_time: 0,
    fps: 0,
    scaled_dt: 0,
    update(t) {
        this.last_time = this.t
        this.t = t
        this.dt = this.t - this.last_time
        this.fps = 1000 / this.dt
        this.scaled_dt = this.dt / (1000 / 60)
    },
}
