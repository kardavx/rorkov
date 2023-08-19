import Roact from "@rbxts/roact";
import RoactSpring from "@rbxts/roact-spring";
import Hooks from "@rbxts/roact-hooks";

const loadingScreenId = 14494426424;
const loadingCircle = 14494487318;

// App story for Hoarcekat
export = (target: Frame): (() => void) => {
	const loadingScreen = (
		<frame Size={new UDim2(1, 0, 1, 0)} AnchorPoint={new Vector2(0.5, 0.5)} Position={new UDim2(0.5, 0, 0.5, 0)}>
			<frame
				BackgroundColor3={new Color3(0, 0, 0)}
				Size={new UDim2(1, 0, 1, 0)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				ZIndex={2}
			/>
			<imagelabel
				Image={`rbxassetid://${loadingScreenId}`}
				Size={new UDim2(1, 0, 1, 0)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={new UDim2(0.5, 0, 0.5, 0)}
			/>
			<imagelabel
				Image={`rbxassetid://${loadingCircle}`}
				Size={new UDim2(0.02, 0, 0.035, 0)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={new UDim2(0.967, 0, 0.936, 0)}
				BackgroundTransparency={1}
				ZIndex={3}
			>
				<uiaspectratioconstraint AspectRatio={1} AspectType={Enum.AspectType.FitWithinMaxSize} DominantAxis={Enum.DominantAxis.Width} />
			</imagelabel>
		</frame>
	);
	const mount = Roact.mount(loadingScreen, target);

	return () => {
		Roact.unmount(mount);
	};
};
