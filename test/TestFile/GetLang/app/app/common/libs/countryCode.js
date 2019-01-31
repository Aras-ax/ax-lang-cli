var countryCode = {
	"AR": {
		name: _('Argentina'),
		timeZone: -3,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [56, 60, 64, 149, 153, 157, 161],
			'40': ["0", "56u", "60l", "64u", "149l", "153u", "157l", "161u"]
		}
	},
	/*"BD": {
		name: _('Bangladesh'),
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},*/
	"BR": {
		name: _('Brazil'),
		timeZone: -4,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "120u", "128u", "132l", "136u", "140l", "149l", "153u", "157l", "161u"]
		}
	},
	"CA": {
		name: _('Canada'),
		timeZone: -5,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 132, 136, 140, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "120u", "128u", "132l", "136u", "140l", "149l", "153u", "157l", "161u"]
		}
	},
	"CN": {
		name: _('China'),
		timeZone: 8,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 149, 153, 157, 161, 165],
			'40': ["0", "149l", "153u", " 157l", "161u"],
			'80': [149, 153, 157, 161]
		}
	},
	"CO": {
		name: _('Colombia'),
		timeZone: -5,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "149l", "153u", "157l", "161u"],
			'80': [0, 36, 40, 44, 48, 52, 56, 60, 64, 149, 153, 157, 161]
		}
	},
	"CZ": {
		name: _('CzechRepublic'),
		timeZone: 1,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "116l", "120u", "124l", "128u", "132l", "136u"]
		}
	},
	"EG": {
		name: _("Egypt"),
		timeZone: 2,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},
	"GB": {
		name: _('England'),
		timeZone: 0,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "116l", "120u", "124l", "128u", "132l", "136u"]
		}
	},
	"FR": {
		name: _('France'),
		timeZone: 1,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "116l", "120u", "124l", "128u", "132l", "136u"]
		}
	},

	"DE": {
		name: _('Germany'),
		timeZone: 1,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "116l", "120u", "124l", "128u", "132l", "136u"]
		}
	},
	"HK": {
		name: _('Hong Kong'),
		timeZone: 8,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "120u", "128u", "132l", "136u", "140l", "149l", "153u", "157l", "161u"]
		}
	},
	"IN": {
		name: _('India'),
		timeZone: 5.5, //特殊处理印度时区5:30
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "149l", "153u", "157l", "161u"]
		}
	},
	"ID": {
		name: _('Indonesia'),
		timeZone: 7,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [149, 153, 157, 161],
			'40': ["149l", "153u", "157l", "161u"]
		}
	},
	"IR": {
		name: _('Iran'),
		timeZone: 3,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},
	"IQ": {
		name: _('Iraq'),
		timeZone: 3,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "116l", "120u", "124l", "128u", "132l", "136u"]
		}
	},
	"MX": {
		name: _('Mexico'),
		timeZone: -6,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u"]
		}
	},
	"AU": {
		name: _('Australia'),
		timeZone: 10,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},
	"TW": {
		name: _('Taiwan'),
		timeZone: 8,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
		channel_5g: {}
	},
	"ID": {
		name: _('Indonesia'),
		timeZone: 7,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},
	"MY": {
		name: _('Malaysia'),
		timeZone: 8,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},
	/*"NP": {
		name: _('Nepal'),
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},*/
	"PE": {
		name: _('Peru'),
		timeZone: -5,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},
	"PK": {
		name: _('Pakistan'),
		timeZone: 5,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [149, 153, 157, 161, 165],
			'40': ["149l", "153u", " 157l", "161u"],
			'80': [149, 153, 157, 161]
		}
	},
	"PH": {
		name: _('Philippines'),
		timeZone: 8,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "120u", "128u", "132l", "136u", "140l", "149l", "153u", "157l", "161u"]
		}
	},
	"PL": {
		name: _('Poland'),
		timeZone: 1,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "116l", "120u", "124l", "128u", "132l", "136u"]
		}
	},
	"RO": {
		name: _('Romania'),
		timeZone: 2,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u"]
		}
	},
	"RU": {
		name: _('Russia'),
		timeZone: 3,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40.44, 48, 132, 136, 140, 149, 153, 157, 161]
		}
	},

	"SA": {
		name: _('Saudi Arabia'),
		timeZone: 3,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [36, 40, 44, 48, 52, 56, 60, 64, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "149l", "153u", "157l", "161u"]
		}
	},
	"ZA": {
		name: _('South Africa'),
		timeZone: 2,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "120u", "128u", "132l", "136u", "140l", "149l", "153u", "157l", "161u"]
		}
	},
	"ES": {
		name: _('Spain'),
		timeZone: -1,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "116l", "120u", "124l", "128u", "132l", "136u"]
		}
	},
	"TH": {
		name: _('Thailand'),
		timeZone: 7,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "120u", "128u", "132l", "136u", "140l", "149l", "153u", "157l", "161u"]
		}
	},
	"TR": {
		name: _('Turkey'),
		timeZone: 2,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u"]
		}
	},
	"AE": {
		name: _('United Arab Emirates'),
		timeZone: 3,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [36, 40, 44, 48, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "36u", "40u", "44l", "149l", "153u", "157l", "161u"]
		}
	},
	"US": {
		name: _('United States'),
		timeZone: -5,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u", "100l", "104u", "108l", "112u", "120u", "128u", "132l", "136u", "140l", "149l", "153u", "157l", "161u"],
			'80': [0, 36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165]
		}
	},
	"UA": {
		name: _('Ukraine'),
		timeZone: 2,
		defaultPower: 10,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},

	"VE": {
		name: _('Venezuela'),
		timeZone: -4,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {}
	},
	"VN": {
		name: _('Vietnam'),
		timeZone: 7,
		defaultPower: 29,
		highPower: {
			minPower: 10,
			maxPower: 20,
			defaultPower: 20
		},
		channel: [],
		channel_5g: {
			'20': [0, 36, 40, 44, 48, 52, 56, 60, 64],
			'40': ["0", "36l", "40u", "44l", "48u", "52l", "56u", "60l", "64u"]
		}
	}
}