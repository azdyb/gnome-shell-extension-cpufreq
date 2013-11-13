const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const Config = imports.misc.config;

const UPDATE_INTERVAL = 1;
const DESATURATE = true;

const GnomeShellVersion = Config.PACKAGE_VERSION;

let CPUFreq;
let CPUSysfs;
let CPUFreqIndicator;

if (GnomeShellVersion > "3.5.5")
{
    CPUFreq = imports.misc.extensionUtils.getCurrentExtension();
    CPUSysfs = CPUFreq.imports.cpusysfs;
    CPUFreqIndicator = CPUFreq.imports.indicator.CPUFreqIndicator;
}
else
{
    CPUFreq = imports.ui.extensionSystem.extensions["cpufreq@zdyb.tk"];
    CPUSysfs = CPUFreq.cpusysfs;
    CPUFreqIndicator = CPUFreq.indicator.CPUFreqIndicator;
}

function CPUFrequency(extensionMeta) {
    this._init.apply(this, [extensionMeta]);
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
    
    build_ui: function() {_
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
        this.add();
    },
    
    disable: function() {
        this.run = false;
        Mainloop.source_remove(this._update_handler);
        this.remove();
    },

    remove: function() {
       if (GnomeShellVersion > "3.5.5")
       {
           Main.panel._rightBox.remove_actor(this);
           Main.panel.menuManager.removeMenu(this.menu)
       }
       else
       {
           Main.panel._rightBox.remove_actor(this.actor);
           Main.panel._menus.removeMenu(this.menu)
       }
    },

    add: function() {
       if (GnomeShellVersion > "3.5.5")
       {
           Main.panel._addToPanelBox('cpufreq', this, 0, Main.panel._rightBox);
           Main.panel.menuManager.addMenu(this.menu);
       }
       else
       {
           Main.panel._rightBox.insert_actor(this.actor, 0);
           Main.panel._menus.addMenu(this.menu);
       }
    }
}

function init(extensionMeta) {
    return new CPUFrequency(extensionMeta);
}

