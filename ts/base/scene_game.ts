class Ship extends CoreObject {
    image_index: number
    is_controllable: boolean = false
    constructor(x: number, y: number, image_index: number) {
        super(x, y)
        this.image_index = image_index
    }
    update(): void {
        if (this.is_controllable) {
            const next_pos = new CoreVec2(this.x, this.y)
            next_pos.lerp_to(new CoreVec2(input.x, input.y))
            this.x = next_pos.x
            this.y = next_pos.y
        }
    }
    render(): void {
        draw.strip_transformed('ships', this.image_index, this.x, this.y, 2, 2, 0)
    }
}

obj.add_name('ship')

let player_ship: Ship | null = null

const scene_game = new CoreScene()

scene_game.start = () => {
    player_ship = obj.instantiate('ship', new Ship(stage.mid.w, stage.mid.h, 1))
    player_ship.is_controllable = true
}

scene_game.update = () => {
}

scene_game.render = () => {
    const tile_scale = 3
    const tile_size = 16 * tile_scale
    const tile_vertical_move = Math.floor(time.t / 10) % tile_size
    for (let i = stage.w / tile_size; i >= 0; i--) {
        for (let j = stage.h / tile_size; j >= -1; j--) {
            draw.strip_transformed('tiles', 50, i * tile_size, j * tile_size + tile_vertical_move, tile_scale, tile_scale, 0)
        }
    }
}

scene_game.render_ui = () => {
}
