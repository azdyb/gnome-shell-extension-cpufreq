const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Governor = "scaling_governor";
const Governors = "scaling_available_governors";
const Frequency = "scaling_cur_freq";
const Frequencies = "scaling_available_frequencies";
const MaxFrequency = "scaling_max_freq";
const MinFrequency = "scaling_min_freq";

function Cpu(sys_path) {
    this._init(sys_path);
};

Cpu.prototype = {
    
    id: "",
    min: 0,
    max: 0,
    available_frequencies: [],
    available_governors: [],
    
    _init: function(sys_path) {
        if (!sys_path) return;
        this.sys_path = sys_path;
        this._discover_parameters();
    },

    set_governor: function(governor) {
        GLib.spawn_command_line_async("cpufreq-set -g " + governor + " -c " + this.id);
    },

    get_governors: function() {
        return this.__get_array(this.sys_path + "/" + Governors);
    },
    
    get_current_governor: function() {
        return this.__get_value(this.sys_path + "/" + Governor);
    },

    get_frequencies: function() {
        return this.__get_array(this.sys_path + "/" + Frequencies).sort(__compare_numbers_desc);
    },
    
    get_current_frequency: function() {
        let freq = this.__get_value(this.sys_path + "/" + Frequency);

        return freq == null ? 0 : freq;
    },
    
    get_current_frequency_formatted: function() {
        return format_frequency(this.get_current_frequency());
    },
    
    get_current_frequency_range: function() {
        let curr = this.get_current_frequency();
        let percent = (curr - this.min) / this.max;
        if (percent >= 0.875) return 100;
        if (percent >= 0.625) return 75;
        if (percent >= 0.375) return 50;
        if (percent >= 0.125) return 25;
        return "na"; 
    },
    
    _discover_parameters: function() {
        this.available_governors = this.get_governors();
        this.available_frequencies = this.get_frequencies();
        this.min = this.available_frequencies[this.available_frequencies.length - 1];
        this.max = this.available_frequencies[0] - this.min;
        this.id = parseInt(this.__get_value(this.sys_path + "/affected_cpus"));
    },
    
    __get_array: function(filename) {
        return __get_array(filename);
    },
    
    __get_value: function(filename) {
        return __get_value(filename);
    },
}

function __get_array(filename) {
    let content = __get_value(filename);
    if (content[0]) {
        return content[1].toString().match(/\w+/g);
    }
    else return [];
}

function __get_value(filename) {
    let content = null; 
    try
    {
        let file = GLib.file_get_contents(filename);
        if (file[0]) {
            content = file[1].toString().match(/\w+/);
        }
    }
    finally
    {
        return content;
    }
}

function __compare_numbers_desc(a, b) {
    return b - a;
}

function format_frequency(freq) {
    let unit = 0;

    while(freq >= 1000) {
        freq /= 1000;
        ++unit;
    }
    
    let format = freq.toPrecision(3);
    if (unit == 0) format += " KHz";
    if (unit == 1) format += " MHz";
    if (unit == 2) format += " GHz";
    if (unit == 3) format += " THz";

    return format;
}

