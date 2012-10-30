var settings;

settings = {
  type: 'json',
  csv_separator: ';',
  duplicate: false,
  samples: {
    csv: "name;textfield\nArjen;\"some text\"",
    json: "{\n	\"name\": {\n		\"firstname\": \"Arjen\",\n		\"lastname\": \"Scherff-de Water\"\n	},\n	\"textfield\": \"some text\"\n}"
  }
};
