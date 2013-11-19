What is CPU Frequency?
========================

CPU Frequency is a GNOME Shell extension that adds an applet to the main panel, which shows current CPU(s) frequency.


What it looks like?
===================

Everybody loves screenshots, right?

.. image:: http://img26.imageshack.us/img26/8619/cpufreq.png
   :alt: CPU Frequency

.. image:: http://img585.imageshack.us/img585/6726/cpufreqmenu.png
   :alt: CPU Frequency with menu

.. image:: http://img6.imageshack.us/img6/6573/cpufreqcolor.png
   :alt: CPU Frequency without desaturating

Disclaimer
==========

As I couldn't find any real documentation for writing gnome-shell extensions, I based my code on better or worse snippets and tutorials found on internet. Some of the sources are mentioned below:

* `gnome-shell-extensions <http://git.gnome.org/browse/gnome-shell-extensions/>`_
* `Musings of an OS plumber <http://blog.fpmurphy.com/tag/gnome-shell>`_
* `Linux Mint Shell Extensions for Gnome 3 (MGSE) <https://github.com/linuxmint/MGSE>`_

How it works?
=============

The extension scans /sys/devices/system/cpu[0-9]+/cpufreq directories to find information about available and current CPU frequencies and presents it graphically.


Instalation
===========

The cpufreq@arfbtwn.uk directory should be copied to /usr/share/gnome-shell/extensions or ~/.local/share/gnome-shell/extensions/::

  # cp cpufreq\@arfbtwn.uk /usr/share/gnome-shell/extensions
  
or::

  $ cp cpufreq\@arfbtwn.uk ~/.local/share/gnome-shell/extensions/
  
Please do not forget to enable the newly installed extension using for example gnome-tweak-tool_.

.. _gnome-tweak-tool: http://live.gnome.org/GnomeTweakTool

If you don't want icons to be desaturated, you can edit cpufreq\@zdyb.tk/extension.js file
and change DESATURATE to false::

  const DESATURATE = false;


Icons
=====

The cpu icons are borrowed from GNOME 2.x applet named cpufreq_. The icons are
included in GNOME repository, so I assume the original author has nothing
against using them in this project. If it's not true, please someone let me know.

.. _cpufreq: http://git.gnome.org/browse/gnome-applets/tree/cpufreq

License
=======

Copyright 2011 Aleksander Zdyb

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see http://www.gnu.org/licenses/.
