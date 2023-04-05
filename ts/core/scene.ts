interface CoreSceneManager {
    DUMMY_SCENE: CoreScene
    current_scene: CoreScene
    previous_scene: CoreScene
    change_scene(new_scene: CoreScene): void
    restart(): void
    update(): void
    render(): void
    render_ui(): void
}

class CoreScene {
    is_auto_clear_stage: boolean = true
    is_obj_update_disabled: boolean = false
    is_obj_render_disabled: boolean = false
    constructor() { }
    start() { }
    update() { }
    render() { }
    render_ui() { }
}

core.scene = {
    DUMMY_SCENE: new CoreScene(),
    current_scene: null as any,
    previous_scene: null as any,
    change_scene(new_scene) {
        this.previous_scene = this.current_scene
        this.current_scene = new_scene
        if (this.current_scene !== this.previous_scene) {
            this.restart()
        }
    },
    restart() {
        this.current_scene.start()
    },
    update() {
        this.current_scene.update()
    },
    render() {
        this.current_scene.render()
    },
    render_ui() {
        this.current_scene.render_ui()
    },
}

core.scene.current_scene = core.scene.DUMMY_SCENE
core.scene.previous_scene = core.scene.DUMMY_SCENE
