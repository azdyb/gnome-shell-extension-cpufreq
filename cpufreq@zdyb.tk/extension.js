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

const UPDATE_INTERVAL = 1000;
const DESATURATE = true;

let cpufreq;

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
	
	Run: function() {
		this.run = true;
		this.update();
		Mainloop.timeout_add(UPDATE_INTERVAL, Lang.bind(this, this.update));
	},
	
	Stop: function() {
		this.run = false;
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
	}
}

function init(extensionMeta) {
	cpufreq = new CPUFrequency(extensionMeta);
    Main.panel._rightBox.insert_actor(cpufreq.actor, 0);
	Main.panel._menus.addMenu(cpufreq.menu);
}


function enable() {
	cpufreq.actor.show();
	cpufreq.Run();
}

function disable() {
	cpufreq.actor.hide();
	cpufreq.Stop();
}

