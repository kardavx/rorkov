import Roact from "@rbxts/roact";
import Hooks from "@rbxts/roact-hooks";
import ShobnodeNode from "./ShobnodeNode";

type props = {
	data: Array<[string, Enum.MessageType]>;
	logger_visible: Roact.Binding<boolean>;
};

let binding = Roact.createBinding(new UDim2());
const label = (text: string, textcolor?: Color3) => {
	return <ShobnodeNode size={8} position={binding[0]} data={[text]} color={textcolor || new Color3(1, 1, 1)} />;
};

const ShobnodeOutput: Hooks.FC<props> = (_props: props, { useState, useEffect }): Roact.Element => {
	let children: Roact.Element[] = [];

	_props.data.forEach((element) => {
		let color = new Color3(1, 1, 1);
		if (element[1] === Enum.MessageType.MessageInfo) {
			color = Color3.fromRGB(92, 148, 252);
		} else if (element[1] === Enum.MessageType.MessageError) {
			color = Color3.fromRGB(255, 97, 97);
		} else if (element[1] === Enum.MessageType.MessageWarning) {
			color = Color3.fromRGB(255, 181, 97);
		}

		children.push(label(element[0], color));
	});

	return (
		<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={_props.logger_visible}>
			<frame
				BackgroundTransparency={1}
				BackgroundColor3={new Color3(0, 0, 0)}
				BorderSizePixel={0}
				Size={new UDim2(1, 0, 1, 0)}
				Visible={true}
			>
				<uilistlayout SortOrder={"LayoutOrder"} VerticalAlignment={"Bottom"} HorizontalAlignment={"Left"} />
				{children}
			</frame>
		</frame>
	);
};

export = new Hooks(Roact)(ShobnodeOutput);
