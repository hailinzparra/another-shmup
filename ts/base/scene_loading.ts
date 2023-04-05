const scene_loading = new CoreScene()

scene_loading.start = () => {
}

scene_loading.render = () => {
    draw.set_font(font.l, { style: 'bold' })
    draw.set_hvalign('center', 'middle')
    draw.set_color('black')
    draw.text(stage.mid.w, stage.mid.h, 'LOADING')
    draw.rect(0, stage.h - 16, stage.w * loader.get_load_progress(), 16)
    if (loader.get_is_loaded()) {
        scene.change_scene(scene_game)
    }
}
