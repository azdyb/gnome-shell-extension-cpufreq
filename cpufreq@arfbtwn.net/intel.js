const Config = imports.misc.config;
const GnomeShellVersion = Config.PACKAGE_VERSION;

let CPUFreq;
let Acpi;
if (GnomeShellVersion > "3.5.5")
{
    CPUFreq = imports.misc.extensionUtils.getCurrentExtension();
    Acpi = CPUFreq.imports.acpi.Cpu;
}
else
{
    CPUFreq = imports.ui.extensionSystem.extensions["cpufreq@arfbtwn.net"];
    Acpi = CPUFreq.acpi.Cpu;
}

const Frequency = "cpuinfo_cur_freq";
const MaxFrequency = "cpuinfo_max_freq";
const MinFrequency = "cpuinfo_min_freq";

function Cpu(sys_path) {
    Acpi.call(this, sys_path);
}

Cpu.prototype = new Acpi();
Cpu.prototype.constructor = Cpu;

Cpu.prototype.get_current_frequency = function()
{
    return this.__get_value(this.sys_path + "/" + Frequency);
};

Cpu.prototype.get_frequencies = function()
{
    return [ 
        this.__get_value(this.sys_path + "/" + MaxFrequency),
        this.__get_value(this.sys_path + "/" + MinFrequency)
            ];

};

Cpu.prototype.get_governors = function()
{
    return ["internal"];
};

Cpu.prototype.get_current_governor = function()
{
    return "internal";
};

Cpu.prototype.set_governor = function(governor)
{
    return;
};
