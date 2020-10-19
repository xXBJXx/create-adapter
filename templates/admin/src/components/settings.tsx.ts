import { TemplateFunction } from "../../../../src/lib/createAdapter";
import { AdapterSettings, getDefaultAnswer } from "../../../../src/lib/questions";

function generateSettingsMethod(settings: AdapterSettings): string {
	if (settings.inputType === "select" && settings.options) {
		const options = settings.options.map((opt) => ({ value: opt.value, title: opt.text }));
		return `
				{renderSelect("${settings.label || settings.key}", "${settings.key}", ${JSON.stringify(options)})}`;
	} else if (settings.inputType === "checkbox") {
		return `
				{this.renderCheckbox("${settings.label || settings.key}", "${settings.key}")}`;
	} else {
		return `
				{this.renderInput("${settings.label || settings.key}", "${settings.key}", "${settings.inputType}")}`;
	}
}

const templateFunction: TemplateFunction = answers => {

	const useTypeScript = answers.language === "TypeScript";
	const useReact = answers.adminReact === "yes";
	if (!(useTypeScript && useReact)) return;

	const adapterSettings: AdapterSettings[] = answers.adapterSettings ?? getDefaultAnswer("adapterSettings")!;

	const template = `
import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import { CreateCSSProperties } from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import I18n from "@iobroker/adapter-react/i18n";

const styles = (): Record<string, CreateCSSProperties> => ({
	input: {
		marginTop: 0,
		minWidth: 400,
	},
	button: {
		marginRight: 20,
	},
	card: {
		maxWidth: 345,
		textAlign: "center",
	},
	media: {
		height: 180,
	},
	column: {
		display: "inline-block",
		verticalAlign: "top",
		marginRight: 20,
	},
	columnLogo: {
		width: 350,
		marginRight: 0,
	},
	columnSettings: {
		width: "calc(100% - 370px)",
	},
	controlElement: {
		//background: "#d2d2d2",
		marginBottom: 5,
	},
});

interface SettingsProps {
	classes: Record<string, string>;
	native: any;

	onChange: (attr: string, value: any) => void;
}

interface SettingsState {
	// add your state properties here
	dummy?: undefined;
}

class Settings extends React.Component<SettingsProps, SettingsState> {
	constructor(props: SettingsProps) {
		super(props);

		this.state = {};
	}

	renderInput(title: string, attr: string, type: string) {
		return (
			<TextField
				label={I18n.t(title)}
				className={this.props.classes.input + " " + this.props.classes.controlElement}
				value={this.props.native[attr]}
				type={type || "text"}
				onChange={(e) => this.props.onChange(attr, e.target.value)}
				margin="normal"
			/>
		);
	}

	renderSelect(
		title: string,
		attr: string,
		options: { value: string; title: string }[],
		style?: any,
	) {
		return (
			<FormControl
				className={this.props.classes.input + " " + this.props.classes.controlElement}
				style={Object.assign({ paddingTop: 5 }, style)}
			>
				<Select
					value={this.props.native[attr] || "_"}
					onChange={(e) => this.props.onChange(attr, e.target.value === "_" ? "" : e.target.value)}
					input={<Input name={attr} id={attr + "-helper"} />}
				>
					{options.map((item) => (
						<MenuItem key={"key-" + item.value} value={item.value || "_"}>
							{I18n.t(item.title)}
						</MenuItem>
					))}
				</Select>
				<FormHelperText>{I18n.t(title)}</FormHelperText>
			</FormControl>
		);
	}

	renderCheckbox(title: string, attr: string, style?: any) {
		return (
			<FormControlLabel
				key={attr}
				style={Object.assign({ paddingTop: 5 }, style)}
				className={this.props.classes.controlElement}
				control={
					<Checkbox
						checked={this.props.native[attr]}
						onChange={() => this.props.onChange(attr, !this.props.native[attr])}
						color="primary"
					/>
				}
				label={I18n.t(title)}
			/>
		);
	}

	render() {
		return (
			<form className={this.props.classes.tab}>${adapterSettings.map(generateSettingsMethod).join("<br />")}
			</form>
		);
	}
}

export default withStyles(styles)(Settings);
`;
	return template.trim();
};

export = templateFunction;


