import { log } from "./log_message"

export default (model: Model, root?: BasePart, propertiesToDisable?: string[]) => {
    let weldRoot = root
    if (!weldRoot) {
        if (!model.PrimaryPart) throw 'No root has been specified and models primary part doesnt exist!'
        weldRoot = model.PrimaryPart
    }

    const startTick = os.clock()
    model.GetDescendants().forEach((child) => {
        if (!child.IsA('BasePart')) return

        if (propertiesToDisable) propertiesToDisable.forEach((propertyName: string) => child[propertyName] = false)

        const part0 = weldRoot
        const part1 = child

        if (child.GetAttribute('animatable') === true) {
            const motor = new Instance('Motor6D')
            motor.Part0 = part0
            motor.Part1 = part1
            motor.C0 = motor.Part0!.CFrame.Inverse().mul(motor.Part1!.CFrame)
            motor.Parent = part0
        } else {
            const weld = new Instance('WeldConstraint')
            weld.Part0 = part0
            weld.Part1 = part1
            weld.Parent = part0
        }
    })

    log('verbose', `model of name ${model.Name} welded in ${os.clock()-startTick}s`)
}