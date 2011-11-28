const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

function CPU(sys_path) {
    this._init(sys_path);
};

CPU.prototype = {
    
    id: "",
    available_frequencies: [],
    available_governors: [],
    
    _init: function(sys_path) {
        this.sys_path = sys_path;
        this._discover_parameters();
    },
    
    get_current_goveror: function() {
        return this.__get_value(this.sys_path + "/scaling_governor");
    },
    
    get_current_frequency: function() {
        return this.__get_value(this.sys_path + "/scaling_cur_freq");
    },
    
    get_current_frequency_formated: function() {
        return format_frequency(this.get_current_frequency());
    },
    
    get_current_frequency_range: function() {
        let curr = this.get_current_frequency();
        let max = this.available_frequencies[0];
        let percent = curr/max;
        if (percent >= 0.875) return 100;
        if (percent >= 0.625) return 75;
        if (percent >= 0.375) return 50;
        return 25;        
    },
    
    _discover_parameters: function() {
        this.available_governors = this.__get_array(this.sys_path + "/scaling_available_governors");
        this.available_frequencies = this.__get_array(this.sys_path + "/scaling_available_frequencies").sort(this.__compare_numbers_desc);
        this.id = parseInt(this.__get_value(this.sys_path + "/affected_cpus"));
    },
    
    __get_array: function(filename) {
        let content = GLib.file_get_contents(filename);
        if (content[0]) {
            return content[1].toString().match(/\w+/g);
        }
        else return [];
    },
    
    __get_value: function(filename) {
        let content = GLib.file_get_contents(filename);
        if (content[0]) {
            return content[1].toString().match(/\w+/);
        }
        else return null;
    },
    
    __compare_numbers_desc: function (a, b) {
        return b - a;
    }
}

function get_cpus() {
    let cpus = [];
    let cpu_dir = Gio.file_new_for_path("/sys/devices/system/cpu");
    let files = cpu_dir.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, null);
    
    let file;
    while((file = files.next_file(null))) {
        if (file.get_name().match(/cpu\d+/))
            cpus.push(new CPU("/sys/devices/system/cpu/" + file.get_name() + "/cpufreq"));
    }
    
    return cpus;
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