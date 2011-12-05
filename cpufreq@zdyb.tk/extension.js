const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;

const CPUFreq = imports.ui.extensionSystem.extensions["cpufreq@zdyb.tk"];
const CPUSysfs = CPUFreq.cpusysfs;
const CPUFreqIndicator = CPUFreq.indicator.CPUFreqIndicator;

const UPDATE_INTERVAL = 1;
const DESATURATE = true;


function CPUFrequency(extensionMeta) {
    this._init.apply(this, [extensionMeta, ]);
}

CPUFrequency.prototype = {
    __proto__: PanelMenu.Button.prototype,
	
	run: false,
	
	cpus: [],
	indicators: [],
	
    _init: function(extensionMeta){
        PanelMenu.Button.prototype._init.call(this, 0);
		this.extensionMeta = extensionMeta;
		
		this.cpus = CPUSysfs.get_cpus();
		
		for each (let cpu in this.cpus) {
			this.indicators.push(new CPUFreqIndicator(this.extensionMeta, cpu));
		}
			
		this.build_ui();
    },
	
	update: function() {
		for each (let ind in this.indicators) {
			ind.update();
		}
		return this.run;
	},
	
	build_ui: function() {
		this.box = new St.BoxLayout();
		if (DESATURATE) this.box.add_effect_with_name("grayscale", new Clutter.DesaturateEffect({ factor: 1 }));
		for each (let ind in this.indicators) {
			this.box.add_actor(ind.actor);
			this.menu.addMenuItem(ind.menu);
		}
		this.actor.add_actor(this.box);
	},
	
	enable: function() {
		this.run = true;
		this.update();
		this._update_handler = Mainloop.timeout_add_seconds(UPDATE_INTERVAL, Lang.bind(this, this.update));
		Main.panel._rightBox.insert_actor(this.actor, 0);
		Main.panel._menus.addMenu(this.menu);
	},
	
	disable: function() {
		this.run = false;
		Mainloop.source_remove(this._update_handler);
		Main.panel._rightBox.remove_actor(this.actor);
		Main.panel._menus.removeMenu(this.menu)
	}
}

function init(extensionMeta) {
	return new CPUFrequency(extensionMeta);
}


