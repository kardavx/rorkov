import Roact from "@rbxts/roact";
import Hooks from "@rbxts/roact-hooks";
import ShobnodeNode from "./ShobnodeNode";

type Indexable<T> = { [index: string]: T };

type props = {
	position?: UDim2;
	size?: UDim2;
	header: string;
	data: { [index: number | string]: unknown } | unknown[] | undefined;
};

const padding = (size: number = 8) => {
	return (
		<uipadding
			PaddingLeft={new UDim(0, size)}
			PaddingRight={new UDim(0, size)}
			PaddingTop={new UDim(0, size)}
			PaddingBottom={new UDim(0, size)}
		/>
	);
};

let binding = Roact.createBinding(new UDim2());
const label = (text: string, textcolor?: Color3) => {
	return <ShobnodeNode position={binding[0]} data={[text]} color={textcolor || new Color3(1, 1, 1)} />;
};

const DebugTable: Hooks.FC<props> = (_props: props, { useState }): Roact.Element => {
	let [is_open, set_open] = useState(true);
	let children: Roact.Element[] = [];

	children.push(
		<ShobnodeNode
			onclick={() => {
				set_open(!is_open);
			}}
			position={binding[0]}
			data={[`${is_open ? ">" : "^"} ${_props.header || "Folder"}`]}
			color={Color3.fromRGB(247, 84, 84)}
			size={18}
		/>
	);

	if (_props.data && is_open) {
		let i = 0;
		const crawl = (data: Indexable<unknown>, indent: number) => {
			for (const [index, value] of pairs(data)) {
				if (typeIs(value, "table")) {
					let empty = true;
					for (const [_] of pairs(value)) {
						empty = false;
						break;
					}

					if (empty) {
						children.push(label(`${string.rep("    ", indent)}${tostring(index)}: {}`));
						i += 1;
					} else {
						children.push(label(`${string.rep("    ", indent)}${tostring(index)}: {`));
						i += 1;

						crawl(value as Indexable<unknown>, indent + 1);

						children.push(label(`${string.rep("    ", indent)}}`));
						i += 1;
					}
				} else {
					children.push(label(`${string.rep("    ", indent)}${tostring(index)}: ${tostring(value)}`));
					i += 1;
				}
			}
		};

		crawl(_props.data as Indexable<unknown>, 0);
	}

	return (
		<frame
			BackgroundTransparency={0.5}
			BackgroundColor3={new Color3(0, 0, 0)}
			AutomaticSize={"XY"}
			BorderSizePixel={0}
			Size={_props.size}
			Position={_props.position}
		>
			<uilistlayout SortOrder={"LayoutOrder"} />
			{children}
		</frame>
	);
};

export = new Hooks(Roact)(DebugTable);
