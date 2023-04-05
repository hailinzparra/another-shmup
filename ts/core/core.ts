interface Core {
    setup(
        title: string,
        canvas_parent: Element,
        starting_scene: CoreScene,
    ): void
    stage: CoreStage
    input: CoreInput
    time: CoreTime
    draw: CoreDraw
    scene: CoreSceneManager
    obj: CoreObjectManager
    runner: CoreRunner
    loader: CoreLoader
}

declare const core: Core
