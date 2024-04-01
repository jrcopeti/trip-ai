"You are a seasoned tour guide specializing in assisting travelers with packing for their trips, taking into account their preferences, the destination, the trip's duration, and the weather forecast. Your task is to compile a detailed packing list of at least 10 different items, specifying quantities (e.g., 3 T-shirts, 2 pairs of shoes). Additionally, craft a creative trip title incorporating the traveler's name and destination. Provide creative title where must have the user's name, the city and country. Also provide a brief trip description highlighting the journey's essence in up to three paragraphs. Finally, recommend three specific activities to enjoy in the destination city."

1-
{{name}}, a {{age}} year-old traveller from {{nationality}}, is planning a {{type}} trip to {{city}}, in {{country}}. The trip is scheduled from {{startDate}} to {{endDate}}. {{name}} prefers to travel with a {{size}} suitcase. He/she wants to ensure they pack everything needed and requires the following items: {{requiredItems}}.
He/she will be staying in a {{accomodation}} and is interested in {{interest1}}, {{interest2}} and {{interest3}}. Finally, he/she has made a note that he/she would like to: {{note}}.
Based on {{name}}'s preferences and trip details, plus the average weather for {{city}}, {{country}} during the trip, provide a detailed packing list specifying the quantity of each item, a creative trip title that includes his/her name, the city and the country. Also a brief description highlighting the essence of his journey, and three must-do activities with minimun 3 paragraph.

2-
"{{name}}, a {{age}}-year-old traveler from {{nationality}}, is planning a {{tripType}} trip to {{city}}, {{country}}. The trip is scheduled from {{startDate}} to {{endDate}}. {{name}} prefers to travel with a {{luggageSize}} size suitcase and wants to ensure he/she packs everything needed. For that, he/she requires the following items: {{requiredItems}}. If there is no required items, return an empty array.
Staying in a {{accommodationType}}, {{name}} is interested in {{interest1}}, {{interest2}}, and {{interest3}}. Additionally, {{name}} has noted he/she would specifically like to have: {{note}}. If there is no note, ignore the note part.
Based on {{name}}'s preferences and trip details, plus the average weather for {{city}}, {{country}} during the trip, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes {{name}}, the city, and the country, a brief description highlighting the essence of their journey, and three must-do activities with 2 paragraphs each."


3- with weather forecast

"{{name}}, a {{age}}-year-old traveler from {{nationality}}, is planning a {{tripType}} trip to {{city}}, {{country}}. The trip is scheduled from {{startDate}} to {{endDate}}. {{name}} prefers to travel with a {{luggageSize}} size suitcase and wants to ensure he/she packs everything needed. For that, he/she requires the following items: {{requiredItems}}. If there is no required items, return an empty array.
Staying in a {{accommodationType}}, {{name}} is interested in {{interest1}}, {{interest2}}, and {{interest3}}. Additionally, {{name}} has noted he/she would specifically like to have: {{note}}. If there is no note, ignore the note part.
Based on {{name}}'s preferences and trip details, plus the weather forecast for {{city}}, {{country}} written below, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes {{name}}, the city, and the country, a brief description highlighting the essence of their journey, and three must-do activities with 2 paragraphs each.
Weather forecast for {{city}}, {{country}}:
{{weatherForecast}}"

_____

{{name}}, a {{age}}-year-old traveler from {{nationality}}, is planning a {{tripType}} trip to {{city}}, {{country}} with a {{budget}} budget. The trip is scheduled from {{startDate}} to {{endDate}}. {{name}} prefers to travel with a {{luggageSize}} size suitcase and wants to ensure he/she packs everything needed. For that, he/she requires the following items: {{requiredItems}}. If there is no required items, return an empty array.
Staying in a {{accommodationType}}, {{name}} is interested in {{interest1}}, {{interest2}}, and {{interest3}}. Additionally, {{name}} has noted he/she would specifically like to have: {{note}}. If there is no note, skip the note part.
Based on {{name}}'s preferences and trip details, plus the average weather for {{city}}, {{country}} during the trip, provide a detailed packing list specifying the quantity of each item. Also, create a creative trip title that includes {{name}}, the city, and the country, a brief description highlighting the essence of their journey, and three must-do activities with 2 paragraphs each."
