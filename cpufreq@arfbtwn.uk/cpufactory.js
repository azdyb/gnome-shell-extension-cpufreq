const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const Config = imports.misc.config;
const GnomeShellVersion = Config.PACKAGE_VERSION;

let CPUFreq;
let Acpi;
let Intel;
if (GnomeShellVersion > "3.5.5")
{
    CPUFreq = imports.misc.extensionUtils.getCurrentExtension();
    Acpi = CPUFreq.imports.acpi.Cpu;
    Intel = CPUFreq.imports.intel.Cpu;
}
else
{
    CPUFreq = imports.ui.extensionSystem.extensions["cpufreq@arfbtwn.uk"];
    Acpi = CPUFreq.acpi.Cpu;
    Intel = CPUFreq.intel.Cpu;
}

const Driver = "scaling_driver";

function __get_value(filename) {
    let content = GLib.file_get_contents(filename);
    if (content[0]) {
        return content[1].toString().match(/\w+/);
    }
    else return null;
}

function cpu_factory(sys_path) {
    if (__get_value(sys_path + "/" + Driver) == "intel_pstate")
        return new Intel(sys_path);

    return new Acpi(sys_path);
}

function get_cpus() {
    let cpus = [];
    let cpu_dir = Gio.file_new_for_path("/sys/devices/system/cpu");
    let files = cpu_dir.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, null);

    let file;
    while((file = files.next_file(null))) {
        if (file.get_name().match(/cpu\d+/))
        {
            let cpu = cpu_factory("/sys/devices/system/cpu/" + file.get_name() + "/cpufreq");
            cpus.push(cpu);
        }
    }

    return cpus;
}

