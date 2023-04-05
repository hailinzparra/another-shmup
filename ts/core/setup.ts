core.stage.setup()

core.setup = (title, canvas_parent, starting_scene) => {
    document.title = title
    canvas_parent.appendChild(core.stage.canvas)
    document.addEventListener('DOMContentLoaded', () => {
        core.stage.resize_event()
    })
    core.input.setup()
    core.scene.change_scene(starting_scene)
}
