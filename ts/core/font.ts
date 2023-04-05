class CoreFont {
    size: number
    style: '' | 'bold' | 'italic' | 'bold italic'
    family: string
    constructor(size: number, style: CoreFont['style'], family: string) {
        this.size = size
        this.style = style
        this.family = family
    }
}
