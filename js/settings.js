var settings;

settings = {
  type: 'json',
  csv_separator: ';',
  duplicate: true,
  samples: {
    csv: "name;textfield\nBarbershop;\"some text\"",
    json: "{\n	\"name\": {\n		\"firstname\": \"Barber\",\n		\"lastname\": \"Shop\"\n	},\n	\"textfield\": \"some text\"\n}"
  }
};
