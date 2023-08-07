type Properties = {[propertyName in string]: any}
type IgnoredBasePartName = string

export default (model: Model, properties: Properties, ignores?: IgnoredBasePartName[]) => {
    model.GetDescendants().forEach((child) => {
        if (
            !child.IsA("BasePart") 
            || ignores 
            && ignores.find((ignored: IgnoredBasePartName) => ignored === child.Name) !== undefined
        ) return

        for (const [propertyName, propertyValue] of pairs(properties)) {
            child[propertyName] = propertyValue
        }
    })
}