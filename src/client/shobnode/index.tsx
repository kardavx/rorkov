/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import Roact from "@rbxts/roact";
import Node from "./ui/ShobnodeNode";
import ShobnodeOutput from "./ui/ShobnodeOutput";

import { Workspace, Players } from "@rbxts/services";

type LocalPlayer = Player & { PlayerGui: PlayerGui };
type fullBinding<T> = [Roact.Binding<T>, (new_value: T) => void];
type positionedNode = {
	data: string[];
	position: fullBinding<UDim2>;
	tree: Roact.Tree;
	color?: Color3;
	anchor_to_middle?: boolean;
};

const convert_value_to_udim2 = (pos: Vector2 | Vector3 | BasePart | Attachment | UDim2): UDim2 => {
	if (typeIs(pos, "UDim2")) {
		return pos;
	} else if (typeIs(pos, "Vector2")) {
		return UDim2.fromOffset(pos.X, pos.Y);
	} else if (typeIs(pos, "Vector3")) {
		const [viewport_position, visible] = Workspace.CurrentCamera!.WorldToScreenPoint(pos);

		let position: Vector2;
		if (!visible) position = new Vector2(0, math.huge);
		else position = new Vector2(viewport_position.X, viewport_position.Y);

		return UDim2.fromOffset(position.X, position.Y);
	} else if (pos.IsA("Attachment")) {
		const [viewport_position, visible] = Workspace.CurrentCamera!.WorldToScreenPoint(pos.WorldPosition);

		let position: Vector2;
		if (!visible) position = new Vector2(0, math.huge);
		else position = new Vector2(viewport_position.X, viewport_position.Y);

		return UDim2.fromOffset(position.X, position.Y);
	} else {
		const [viewport_position, visible] = Workspace.CurrentCamera!.WorldToScreenPoint(pos.Position);

		let position: Vector2;
		if (!visible) position = new Vector2(math.huge, math.huge);
		else position = new Vector2(viewport_position.X, viewport_position.Y);

		return UDim2.fromOffset(position.X, position.Y);
	}
};

// this library is very complicated as you can see
export namespace Shobnode {
	const ui = new Instance("ScreenGui");

	let main_node_tree: Roact.Tree;
	const main_node_data: string[] = [];
	const positioned_nodes: positionedNode[] | undefined[] = [];

	export const configuration = {
		logger_fadeout_time: 15,

		ui_name: "shobfix",
		ui_text_color: Color3.fromRGB(255, 201, 184),

		main_node_position: Roact.createBinding(UDim2.fromOffset(10, 10)),
	};

	export function setup(target?: Instance) {
		ui.Name = configuration.ui_name;
		ui.Parent = target || (Players.LocalPlayer as LocalPlayer).WaitForChild("PlayerGui");

		main_node_tree = Roact.mount(<Node color={configuration.ui_text_color} position={configuration.main_node_position[0]} data={main_node_data} />, ui);
	}

	export function display_variable(sign: number, data: string) {
		main_node_data[sign] = data;
		Roact.update(main_node_tree, <Node color={configuration.ui_text_color} position={configuration.main_node_position[0]} data={main_node_data} />);
	}

	export function display_node(
		sign: number,
		adornee: Vector2 | Vector3 | BasePart | Attachment | UDim2,
		data: string[] | undefined,
		color?: Color3,
		anchor_to_middle?: boolean,
	) {
		const node = positioned_nodes[sign];
		if (node) {
			if (data) {
				node.position[1](convert_value_to_udim2(adornee));
				if (data !== node.data)
					Roact.update(
						node.tree,
						<Node anchor_to_middle={anchor_to_middle} color={node.color || configuration.ui_text_color} position={node.position[0]} data={data} />,
					);
			} else {
				Roact.unmount(node.tree);
				positioned_nodes[sign] = undefined;
			}
		} else if (data) {
			const position = Roact.createBinding(convert_value_to_udim2(adornee));
			const tree = Roact.mount(
				<Node anchor_to_middle={anchor_to_middle} color={color || configuration.ui_text_color} position={position[0]} data={data} />,
				ui,
			);

			positioned_nodes[sign] = {
				position,
				data,
				tree,
				anchor_to_middle,
				color,
			};
		}
	}

	export const logger_visible = Roact.createBinding(true);

	const log_info: Array<[string, Enum.MessageType]> = [];
	const output = Roact.mount(<ShobnodeOutput logger_visible={logger_visible[0]} data={log_info} />, ui);

	const dont_emit = ["TextScraper text too long"];
	export function log(message: string, message_type: Enum.MessageType) {
		for (const [_, value] of pairs(dont_emit)) if (message.find(value)[0] !== undefined) return;
		while (log_info.size() > 60) log_info.shift();

		const log_entry: [string, Enum.MessageType] = [message, message_type];
		log_info.push(log_entry);

		task.delay(configuration.logger_fadeout_time, () => {
			const index = log_info.indexOf(log_entry);
			log_info.remove(index);

			Roact.update(output, <ShobnodeOutput logger_visible={logger_visible[0]} data={log_info} />);
		});

		Roact.update(output, <ShobnodeOutput logger_visible={logger_visible[0]} data={log_info} />);
	}
}
