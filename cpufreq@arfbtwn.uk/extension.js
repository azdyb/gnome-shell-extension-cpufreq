const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;

const UPDATE_INTERVAL = 1;
const DESATURATE = false;

const Config = imports.misc.config;
const GnomeShellVersion = Config.PACKAGE_VERSION;

let CPUFreq;
let CPUFreqIndicator;
let CpuFactory;
if (GnomeShellVersion > "3.5.5")
{
    CPUFreq = imports.misc.extensionUtils.getCurrentExtension();
    CPUFreqIndicator = CPUFreq.imports.indicator.CPUFreqIndicator;
    CpuFactory = CPUFreq.imports.cpufactory;
}
else
{
    CPUFreq = imports.ui.extensionSystem.extensions["cpufreq@arfbtwn.uk"];
    CPUFreqIndicator = CPUFreq.indicator.CPUFreqIndicator;
    CpuFactory = CPUFreq.cpufactory;
}

const DEBUG = false;
function debug(message)
{
    if (DEBUG) log(message);
}

debug("CPUFreq::Shell Version = " + GnomeShellVersion);

function CPUFrequency(extensionMeta) {
    this._init.apply(this, [extensionMeta]);
}

CPUFrequency.prototype = {
    __proto__: PanelMenu.Button.prototype,
    
    run: false,

    // FIXME: Aggregate these somehow from the list
    // provided by each CPU
    governors: [ "userspace", 
                 "powersave", 
                 "conservative",
                 "ondemand",
                 "performance" ],
    
    cpus: [],
    indicators: [],
    selector: null,
    
    _init: function(extensionMeta){
        debug("CPUFreq._init()");
        
        PanelMenu.Button.prototype._init.call(this, 0);
        this.extensionMeta = extensionMeta;
        
        this.cpus = CpuFactory.get_cpus();

        this.build_ui();
        this.build_menu();
        //this.build_selector(); // Disabled for now, see above
        this.build_box();
    },
    
    update: function() {
        debug("CPUFreq.update(): " + this.indicators.length);

        for each (let ind in this.indicators) {
            ind.update();
        }
        return this.run;
    },

    build_selector: function() {
        debug("CPUFreq.build_selector()");

        this.selector = new PopupMenu.PopupSubMenuMenuItem("Governors");
        this.menu.addMenuItem(this.selector);
        
        for each (let governor in this.governors) { 
            let governorItem = new PopupMenu.PopupMenuItem("");
            let governorLabel = new St.Label({
                text: governor,
                style_class: "sm-label"
            });
            governorItem.addActor(governorLabel);
            governorItem.connect('activate', Lang.bind(this, function() {
                for each(let cpu in this.cpus)
                {
                    cpu.set_governor(governorLabel.text);
                }
            }));

            this.selector.menu.addMenuItem(governorItem);
        }
    },

    build_menu: function() {
        debug("CPUFreq.build_menu() indicators = " + this.indicators.length);

        for each (let ind in this.indicators) {
            this.menu.addMenuItem(ind.menu);
        }
    },

    build_box: function() {
        debug("CPUFreq.build_box()");

        this.box = new St.BoxLayout();
        if (DESATURATE) this.box.add_effect_with_name("grayscale", new Clutter.DesaturateEffect({ factor: 1 }));
        for each (let ind in this.indicators) {
            this.box.add_actor(ind.actor);
        }
        this.actor.add_actor(this.box);
    },
    
    build_ui: function() {
        debug("CPUFreq.build_ui() cpus = " + this.cpus.length);
        let inds = [];

        for each (let cpu in this.cpus) {
            inds.push(new CPUFreqIndicator(this.extensionMeta, cpu));
        }

        this.indicators = inds;
    },
    
    enable: function() {
        debug("CPUFreq.enable()");
        this.run = true;
        this.update();
        this._update_handler = Mainloop.timeout_add_seconds(UPDATE_INTERVAL, Lang.bind(this, this.update));
        this.__add();
    },
    
    disable: function() {
        debug("CPUFreq.disable()");
        this.run = false;
        Mainloop.source_remove(this._update_handler);
        this.__remove();
    },

    __add: function() {
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
    },

    __remove: function() {
       if (GnomeShellVersion > "3.5.5")
       {
           Main.panel._rightBox.remove_actor(this.container);
           Main.panel.menuManager.removeMenu(this.menu)
       }
       else
       {
           Main.panel._rightBox.remove_actor(this.actor);
           Main.panel._menus.removeMenu(this.menu)
       }
    }

}

function init(extensionMeta) {
    debug("CPUFreq::init()");
    return new CPUFrequency(extensionMeta);
}
