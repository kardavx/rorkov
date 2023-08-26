import { log } from "./log_message";

const getCustomParent = (model: Model, child: BasePart): BasePart | undefined => {
	const definedCustomParent = child.GetAttribute("customParent") as string;
	if (definedCustomParent === undefined || definedCustomParent === "") return;

	const customParentObject = model.FindFirstChild(definedCustomParent) as BasePart;
	return customParentObject;
};

export default (model: Model, root?: BasePart, properties?: { [propertyName in string]: boolean }) => {
	let weldRoot = root;
	if (!weldRoot) {
		if (!model.PrimaryPart) throw "No root has been specified and models primary part doesnt exist!";
		weldRoot = model.PrimaryPart;
	}

	const startTick = os.clock();
	model.GetDescendants().forEach((child) => {
		if (!child.IsA("BasePart")) return;

		if (properties !== undefined) {
			for (const [propertyName, propertyValue] of pairs(properties)) {
				child[propertyName] = propertyValue;
			}
		}

		const part0 = getCustomParent(model, child) || weldRoot;
		const part1 = child;

		if (child.GetAttribute("animatable") === true) {
			const motor = new Instance("Motor6D");
			motor.Part0 = part0;
			motor.Part1 = part1;
			motor.C0 = motor.Part0!.CFrame.Inverse().mul(motor.Part1!.CFrame);
			motor.Name = part1.Name;
			motor.Parent = part0;
		} else {
			const weld = new Instance("WeldConstraint");
			weld.Part0 = part0;
			weld.Part1 = part1;
			weld.Parent = part0;
			weld.Name = part1.Name;
		}
	});

	log("verbose", `model of name ${model.Name} welded in ${os.clock() - startTick}s`);
};
