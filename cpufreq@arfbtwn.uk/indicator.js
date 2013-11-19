const St = imports.gi.St;
const Panel = imports.ui.panel;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;

function CPUFreqIndicator(extensionMeta, cpu) {
    this._init.apply(this, [extensionMeta, cpu]);
};

CPUFreqIndicator.prototype = {

    cpu: null,
    icons: {},
    destroyed: false,
    
    _init: function(extensionMeta, cpu) {
        this.cpu = cpu;
        this.extensionMeta = extensionMeta;
        
        let paths = {
            na:  this.extensionMeta.path + "/icons/cpufreq-na.png",
            25:  this.extensionMeta.path + "/icons/cpufreq-25.png",
            50:  this.extensionMeta.path + "/icons/cpufreq-50.png",
            75:  this.extensionMeta.path + "/icons/cpufreq-75.png",
            100: this.extensionMeta.path + "/icons/cpufreq-100.png"
        }
        
        for (let p in paths) {
            let icon = Gio.icon_new_for_string(paths[p]);
            this.icons[p] = icon;
        }
        
        this.actor = new St.BoxLayout();
        
        this.icon = new St.Icon({
			gicon: this.icons.na,
            icon_size: Panel.PANEL_ICON_SIZE
		});
        
        this.actor.add_actor(this.icon);
        this.menu = new PopupMenu.PopupMenuItem("cpu" + this.cpu.id, { reactive: false, style_class: "cpu" });
    },
    
    update: function() {
        this.icon.gicon = this.icons[this.cpu.get_current_frequency_range()];
        this.menu.label.set_text("cpu" + this.cpu.id + ": " + this.cpu.get_current_frequency_formatted() +  " (" + this.cpu.get_current_governor() + ")");
    }
}

