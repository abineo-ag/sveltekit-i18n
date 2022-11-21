const template = [
	'',
	'╔═══════════════════════════════╗\n',
	'║      AUTO GENERATED FILE      ║\n',
	'║    DO NOT EDIT ME DIRECTLY    ║\n',
	'╚═══════════════════════════════╝',
];

export default function (prefix = '//', indent = 4) {
	return template.join(prefix + ' '.repeat(indent)) + '\n';
}
