import Roact, { Children } from "@rbxts/roact";
import Hooks from "@rbxts/roact-hooks";

export interface props {
	position?: Roact.Binding<UDim2>;
	data: string[];
	color?: Color3;
	anchor_right?: boolean;
	anchor_to_middle?: boolean;
	size?: number;
	onclick?: () => void;
}

const FONT_SIZE = 14;
const FONT_STYLE = Enum.Font.Code;

const Overlay: Hooks.FC<props> = (_props): Roact.Element => {
	let children: Roact.Element[] = [];
	let size = new Vector2();
	let font_size = _props.size || FONT_SIZE;

	for (const [index, value] of pairs(_props.data)) {
		children.push(
			<textlabel
				RichText={true}
				TextSize={font_size}
				Font={FONT_STYLE}
				Text={value}
				TextXAlignment={"Left"}
				Position={UDim2.fromOffset(0, (index - 1) * font_size)}
				AutomaticSize={"XY"}
				BorderSizePixel={0}
				BackgroundTransparency={0.3}
				BackgroundColor3={new Color3()}
				TextColor3={Color3.fromRGB(43, 43, 43)}
				Event={{
					InputBegan: (rbx, input) => {
						if (input.UserInputType !== Enum.UserInputType.MouseButton1) return;
						_props.onclick?.();
					},
				}}
			>
				<textlabel
					RichText={true}
					TextSize={font_size}
					Font={FONT_STYLE}
					Text={value}
					TextXAlignment={"Left"}
					Position={UDim2.fromOffset(0, -1)}
					AutomaticSize={"XY"}
					BorderSizePixel={0}
					BackgroundTransparency={1}
					BackgroundColor3={new Color3()}
					TextColor3={_props.color}
				/>
			</textlabel>
		);
	}

	return (
		<frame
			BackgroundTransparency={1}
			Position={_props.position}
			AutomaticSize={"XY"}
			AnchorPoint={_props.anchor_to_middle ? new Vector2(0.5, 0.5) : new Vector2()}
			Size={UDim2.fromOffset(size.X, size.Y)}
		>
			{...children}
		</frame>
	);
};

export default new Hooks(Roact)(Overlay);
