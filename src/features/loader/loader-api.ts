import { Trivia } from "../../models/types";
import TriviaFactory from "../../models/factories/trivia.factory";

const trivia   = {
    "quizzes": [
        {
            "id": "1081e5e8-91aa-4ff0-8271-755c7fe93672",
            "title": "Founding of the Green Mountain Club",
            "publishDate": "10-06-2023",
            "image": null,
            "author": "John Need",
            "questions": [
                {
                    "id": "2381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "What year was the Green Mountain Club Founded?",
                    "choices": [
                        {
                            "text": "1876"
                        },
                        {
                            "text": "1903"
                        },
                        {
                            "text": "1910"
                        },
                        {
                            "text": "1917"
                        }
                    ],
                    "correctAnswerIndex": 2,
                    "answerText": "The Green Mountain Club was officially founded on Friday, March 11, 1910.  It followed the founding of the Appalachian Mountain Club in 1876, and the Ascutney Mountain Association in 1903."
                },
                {
                    "id": "3381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "Where was the first meeting of the Green Mountain Club held?",
                    "choices": [
                        {
                            "text": "The True Temper Inn in Wallingford Vermont"
                        },
                        {
                            "text": "The Van Ness House in Burlington Vermont"
                        },
                        {
                            "text": "Roughan Hall in Boston Massachusetts"
                        },
                        {
                            "text": "The Beane Farm in Hanksville Vermont"
                        }
                    ],
                    "correctAnswerIndex": 1,
                    "answerText": "According to an article published in The Vermonter magazine: “On Friday, March 11, 1910 a company of gentlemen from different parts of Vermont met at the Van Ness House for the purpose of forming a Green Mountain Club.  There were about twenty-five present.  Letters were read from many prominent gentlemen who could not come to the meeting, but who wished to express their approval of the project.”\nThe Van Ness House opened in 1897 and was named for Vermont Governor Cornelius P. Van Ness.   It burned in 1951.  Today, a historic marker commemorating the founding of the GMC marks the spot where the hotel once stood.",
                    "answerImage": "https://upload.wikimedia.org/wikipedia/commons/6/6f/The_Van_Ness_House%2C_Burlington%2C_VT.jpg",
                    "answerImageCaption": "The Van Ness House from a 1910 postcard published by C. H. Bessey"
                },
                {
                    "id": "4381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "Who served as the first president of the Green Mountain Club and is considered to be its founder?",
                    "choices": [
                        {
                            "text": "Benton MacKaye"
                        },
                        {
                            "text": "Myron Avery"
                        },
                        {
                            "text": "Edward Pickering"
                        },
                        {
                            "text": "James Taylor"
                        }
                    ],
                    "correctAnswerIndex": 3,
                    "answerText": "James P. Taylor was the Assistant Headmaster of the Vermont Academy in Saxtons River, Vermont who regularly took his students on hikes.  After growing frustrated with the lack of hiking trails in the state he posed the question “Should the Green Mountain Range continue to be sacrosanct to the spirits of the first ‘Green Mountain Boys,’ and to hedgehogs, and untouchable to everybody else?”\nHis answer was the promotion of a club dedicated to creating a trail stretching the entire length of Vermont across the State’s highest peaks.  He recruited many like-minded Vermonters and in 1910, the first meeting of the GMC was held in Burlington Vermont where he was elected President.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2022/09/TaylorJamesP1918-610x992-2.jpg",
                    "answerImageCaption": "James P Taylor, first president of the Green Mountain Club"
                },
                {
                    "id": "5381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "Construction of the Long Trail began in 1912. What was the first completed section?",
                    "choices": [
                        {
                            "text": "Jay Peak to Hazen’s Notch"
                        },
                        {
                            "text": "Sterling Pond to Camel’s Hump"
                        },
                        {
                            "text": "Massachusetts Line to Maple Hill"
                        },
                        {
                            "text": "The “Monroe Skyline”, from Camel’s Hump to Mount Abraham"
                        }
                    ],
                    "correctAnswerIndex": 1,
                    "answerText": "The Mount Mansfield Summit Hotel’s location just below the Nose on Mount Mansfield’s ridge line provided the perfect basecamp for trail crews cutting the first stretch of the Long Trail.  Existing trails to Sterling Pond were incorporated, while James P. Taylor led the crew cutting new trail from the Nose to Nebraska Notch, where Taylor Lodge sits today. Taylor also scouted the route from the Winooski River to Camel’s Hump, incorporating old lumber roads and existing trails.  The abandoned Randall Lumber Camp at the base of Camel’s Hump served as one of the first shelters on the Long Trail.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2023/07/Screenshot-2023-04-08-at-6.49.01-PM-1024x643.png",
                    "answerImageCaption": "Postcard featuring the Mount Mansfield Hotel which closed in 1959"
                },
                {
                    "id": "6381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "The Green Mountain Club is composed of 14 section clubs, each responsible for maintaining the trails in a geographic area.  What was the name of the first GMC section club?",
                    "choices": [
                        {
                            "text": "Mansfield Section"
                        },
                        {
                            "text": "Burlington Section"
                        },
                        {
                            "text": "Worcester Section"
                        },
                        {
                            "text": "Montpelier Section"
                        }
                    ],
                    "correctAnswerIndex": 0,
                    "answerText": "The Mansfield Section was the first GMC section, founded in August 1910.  The section was responsible for the trail from Mount Mansfield to Bolton Mountain.  It started with 10 members   Under the leaders of Harry G. Burrough, the club languished for several years.  It 1916, in an attempt to save the section, it was reorganized and renamed the Burlington Section. A high school teacher and active suffragette, Joanna D. Croft was elected president. During her tenure the club was revitalized and became the GMC's largest section club.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2023/05/cropped-Joanna-D.-Croft-Read-jpg.webp",
                    "answerImageCaption": "Joanna D. Croft, Burlington Section President, 1916-1917"
                }
            ]
        },
        {
            "id": "2081e5e8-91aa-4ff0-8271-755c7fe93674",
            "title": "From MA to Canada",
            "publishDate": "10-13-2023",
            "image": null,
            "author": "John Need",
            "questions": [
                {
                    "id": "9381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "Those who hike the entire Appalachian Trail are called “Thru-Hikers”.  What are folks called who hike the whole Long Trail?",
                    "choices": [
                        {
                            "text": "LT’ers"
                        },
                        {
                            "text": "Thru Hikers"
                        },
                        {
                            "text": "Blaze Runners"
                        },
                        {
                            "text": "End-to-Enders"
                        }
                    ],
                    "correctAnswerIndex": 3,
                    "answerText": "People who hike the entire Long Trailare called “End-to-Enders”. End-to-Enders can hike the entire trail in one go or over time.  Ender-to-Enders can become certified by the Green Mountain Club by applying online, through the GMC website.  Each year, the list of End-to-Enders and their journals are archived at the Vermont Historical Society.",
                    "answerImage": "http://gmcburlington.org/wp-content/uploads/2023/10/end-to-end-patch.png",
                    "answerImageCaption": "End-to-End Rocker Patch"
                },
                {
                    "id": "8381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "The Long Trail is marked from Massachusetts to Quebec with white blazes.   The side trails are blazed blue and connect the Long Trail to shelters, parking lots, springs, overlooks and other points of interest.   Folks who hike the entire Long Trail are called 'End-to-Enders'.  What do we call folks who hike all of the blue-blazed side trails?",
                    "choices": [
                        {
                            "text": "Blue Blazers"
                        },
                        {
                            "text": "Dedicated Day Hikers"
                        },
                        {
                            "text": "Side-to-Siders"
                        },
                        {
                            "text": "There is no name for them"
                        }
                    ],
                    "correctAnswerIndex": 2,
                    "answerText": "Folks who complete all the blue blazed trails connecting to the Long Trail are called “Side-to-Siders”.  Those who accomplish this feat hike a total of 88 trails and 166 miles.  The Green Mountain Club issues certifications for Side-to-Siders.",
                    "answerImage": "https://www.greenmountainclub.org/wp-content/uploads/2021/07/Side-Trails-rock-garden-trail-by-Amy-Potter-1100px-1024x681.jpg",
                    "answerImageCaption": "The Rock Garden Trail is one of the 88 side trails. Photo by: Amy Potter"
                },
                {
                    "id": "7381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "As of the publication date of this quiz, who holds the record as the fastest end-to-ender?",
                    "choices": [
                        {
                            "text": "John Kelly "
                        },
                        {
                            "text": "Scott Jurek"
                        },
                        {
                            "text": "Alyssa Godesky"
                        },
                        {
                            "text": "Karel Sabbe"
                        }
                    ],
                    "correctAnswerIndex": 0,
                    "answerText": "John Kelly is an American endurance athlete who specializes in ultra running.  On July 3, 2023 he completed the Long Trail in 4 days, 4 hours, 25 minutes, and 50 seconds.\nThe women’s record is currently held by Alyssa Godesky who completed the LT on July 31, 2018 with a time of  5 days, 2 hours, and 37 minutes.",
                    "answerImage": "http://gmcburlington.org/wp-content/uploads/2023/10/john-kelly-jpg.webp",
                    "answerImageCaption": "John Kelly, Endurance Athlete"
                },
                {
                    "id": "6381e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "The Long Trail was completed in 1930.  The following year, many picked up the challenge of hiking the trail.  What end-to-ender popularized end-to-ending by publishing an account of his hike entitled 'So Clear, So Cool, So Grand: A 1931 HIke on Vermont’s Long Trail'?",
                    "choices": [
                        {
                            "text": "Earl Victor Shaffer"
                        },
                        {
                            "text": "Roy O. Buchanan"
                        },
                        {
                            "text": "James P. Taylor"
                        },
                        {
                            "text": "James Gordon Hindes"
                        }
                    ],
                    "correctAnswerIndex": 3,
                    "answerText": "In 1931, James Gordon Hindes and his friend John Eames, set out with 60 pound packs intending to be among the first end-to-enders.  His was one of the first published trail journals and serves as one the best depictions of the early days of long-distance hiking.\nHindes' journal is still in print and can be purchased on the Green Mountain Club website.",
                    "answerImage": "http://gmcburlington.org/wp-content/uploads/2023/10/Hindes-Ames-jpg.webp",
                    "answerImageCaption": "James Gordon Hindes and hiking partner John Eames"
                },
                {
                    "id": "5381e5e8-91aa-4ff0-8271-755c7fe93625",
                    "tags": [
                        "HISTORY",
                        "LONG TRAIL"
                    ],
                    "questionText": "What was the nickname given to the trio who were the first women to complete an end-to-end hike?",
                    "choices": [
                        {
                            "text": "The Three Musketeers"
                        },
                        {
                            "text": "The Lady Trampers"
                        },
                        {
                            "text": "Trail Angels"
                        },
                        {
                            "text": "The Three She-roes"
                        }
                    ],
                    "correctAnswerIndex": 0,
                    "answerText": "Hilda M. Kurth and Kathleen M. Norris of Schenectady, New York, and Catherine E. Robbins of Cornwall Vermont set out 1927 to become the first women to complete the Long Trail.   Their 250 mile trek captured the attention of the media who followed them along the trail and dubbed them “The Three Musketeers”.\nTheir hike inspired many women to adopt outdoor sports, including Cara Clifford Nelson and Amity Clifford who hiked the Long Trail in 1997 in honor of their grandmother Catherine Robbins Clifford, the last surviving musketeer.",
                    "answerImage": "https://www.greenmountainclub.org/wp-content/uploads/2017/03/three-musketeers.jpg",
                    "answerImageCaption": "The Three Musketeers"
                }
            ]
        },
        {
            "id": "3181e5e8-91aa-4ff0-8271-755c7fe93639",
            "title": "Long Trail Geography",
            "publishDate": "10-20-2023",
            "image": null,
            "author": "John Need",
            "questions": [
                {
                    "id": "1281e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "GEOGRAPHY",
                        "LONG TRAIL"
                    ],
                    "questionText": "Every hiker knows the Long Trail starts at the Massachusetts border and ends at the Canadian border.  What geographical feature is approximately halfway?",
                    "choices": [
                        {
                            "text": "Breadloaf Mountain"
                        },
                        {
                            "text": "Winooski River"
                        },
                        {
                            "text": "Sherburne Pass"
                        },
                        {
                            "text": "Mount Ellen"
                        }
                    ],
                    "correctAnswerIndex": 0,
                    "answerText": "The halfway mark changes every year due to trail locations but Breadloaf Mountain is considered to be the unofficial halfway point.",
                    "answerImage": "http://gmcburlington.org/wp-content/uploads/2023/10/breadloaf-mountain-jpeg.webp",
                    "answerImageCaption": "Postcard of the Breadloaf campus with a view of Breadloaf Mountain\n"
                },
                {
                    "id": "2281e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "GEOGRAPHY",
                        "LONG TRAIL"
                    ],
                    "questionText": "What mountain inspired both the Long Trail and the Appalachian Trail?",
                    "choices": [
                        {
                            "text": "Mount Mansfield"
                        },
                        {
                            "text": "Stratton Mountain"
                        },
                        {
                            "text": "Camel’s Hump"
                        },
                        {
                            "text": "Mount Ellen"
                        }
                    ],
                    "correctAnswerIndex": 1,
                    "answerText": "In 1900, while climbing a tree on the summit of Stratton Mountain, Benton MacKaye was struck with a vision.  “I felt as if atop the world, with a sort of ‘planetary feeling.’ … Would a footpath someday reach [far-southern peaks] from where I was then perched?”  That vision would lead to the construction of the Appalachian Trail.\nIn 1909, while sitting in his tent in the rain or the side of Stratton Mountain in 1909, James P. Taylor was struck with  the idea of a long trail running over the tallest peaks of the  Green Mountains from the Massachusetts line to the Canadian border.\nTaylor immediately  began acting on his idea, founding the Green Mountain Club in 1910.   Construction of the Long Trail began in 1912.   MacKaye wouldn’t propose the idea of building the Appalachian Trail until 1921.",
                    "answerImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/BentonMacKaye.jpg/640px-BentonMacKaye.jpg",
                    "answerImageCaption": "Benton MacKaye, Originator of the Appalachian Trail"
                },
                {
                    "id": "3281e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "GEOGRAPHY",
                        "LONG TRAIL"
                    ],
                    "questionText": "Of all the Long Trail peaks named for people, which is the only one named after a fictional character?",
                    "choices": [
                        {
                            "text": "Mount Abraham"
                        },
                        {
                            "text": "Jay Peak"
                        },
                        {
                            "text": "General Stark Mountain"
                        },
                        {
                            "text": "Mount Ellen"
                        }
                    ],
                    "correctAnswerIndex": 3,
                    "answerText": "There are two theories as to how Mount Ellen got its name.  The first is that Joseph Battell, a publisher, environmentalist, and philanthropist from Middlebury, Vermont, named Mount Ellen after the fictional character in his book \"Ellen, or the Whisperings of an Old Pine\" published in 1903.  The other is that the mountain was named for Ellen Douglas, the heroine in Sir Walter Scott's poem The Lady of the Lake published in 1810.",
                    "answerImage": "https://upload.wikimedia.org/wikipedia/commons/4/49/0030207d_%28cropped%29.jpg",
                    "answerImageCaption": "Ellen beheld as in a dream, / Then, starting, scarce suppressed a scream.' (Lady of the Lake, Canto IV, stanza 16)"
                },
                {
                    "id": "4281e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "GEOGRAPHY",
                        "LONG TRAIL"
                    ],
                    "questionText": "How many fire towers can a hiker climb while on the Long Trail?",
                    "choices": [
                        {
                            "text": "4"
                        },
                        {
                            "text": "3"
                        },
                        {
                            "text": "2"
                        },
                        {
                            "text": "1"
                        }
                    ],
                    "correctAnswerIndex": 0,
                    "answerText": "Hikers can climb four lookout towers while hiking the Long Trail over Glastenbury, Stratton, Bromley, and Belvidere mountains.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2023/01/Screenshot-2023-01-30-at-5.23.19-PM.png",
                    "answerImageCaption": "The firetower on Belvidere Mountain"
                },
                {
                    "id": "5281e5e8-91aa-4ff0-8271-755c7fe93671",
                    "tags": [
                        "GEOGRAPHY",
                        "LONG TRAIL"
                    ],
                    "questionText": "The Chin on Mount Mansfield is the highest point on the Long Trail.  What’s the Lowest?",
                    "choices": [
                        {
                            "text": "Clarendon Gorge"
                        },
                        {
                            "text": "The Massachusetts Line"
                        },
                        {
                            "text": "Lamoille River Crossing"
                        },
                        {
                            "text": "Winooski River Crossing"
                        }
                    ],
                    "correctAnswerIndex": 3,
                    "answerText": "The lowest point on the Long Trail is where the trail crosses the Winooski River, near the town of Jonesville. This point is located at an elevation of approximately 320 feet (98 meters) above sea level. The 224ft suspension bridge that crosses the river here was first authorized by the Vermont Legislature in 1912, but wasn't opened until 2015.  Before the bridge, hikers crossed the river after a long road walk to the Jonesville bridge or by taking a ferry ride provided by residents of Bolton.",
                    "answerImage": "http://gmcburlington.org/wp-content/uploads/2023/07/Crossing-the-Winooski-River-at-Bolton-1928-jpg.webp",
                    "answerImageCaption": "Crossing the Winooski River at Bolton, 1928"
                }
            ]
        },
        {
            "id": "4181e5e8-91aa-4ff0-8271-755c7fe93639",
            "title": "Gimme Shelters",
            "publishDate": "10-27-2023",
            "image": null,
            "author": "John Need",
            "questions": [
                {
                    "id": "1481e5e8-91aa-4ff0-8271-755c7fe93673",
                    "tags": [
                        "SHELTERS",
                        "LONG TRAIL"
                    ],
                    "questionText": "What was the first official Long Trail shelter built by the Green Mountain Club?\n",
                    "choices": [
                        {
                            "text": "The Long Trail Lodge"
                        },
                        {
                            "text": "Emily Proctor Lodge"
                        },
                        {
                            "text": "Aeolus View Shelter"
                        },
                        {
                            "text": "Taft Lodge"
                        }
                    ],
                    "correctAnswerIndex": 1,
                    "answerText": "The first shelter built by the GMC was the Emily Proctor Lodge in 1913. This was one of three shelters funded by Emily Proctor, daughter of Vermont Governor Redfield Proctor. A resident of Proctor Vermont, she helped run the family business, the Vermont Marble Company.  Emily was also a social reformer, promoting workers’ rights, women’s suffrage, and outdoor recreation.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2023/04/cropped-Emily-Proctor-Lodge-1918.jpg\n",
                    "answerImageCaption": "Emily Proctor Lodge, 1918"
                },
                {
                    "id": "2481e5e8-91aa-4ff0-8271-755c7fe93673",
                    "tags": [
                        "SHELTERS",
                        "LONG TRAIL"
                    ],
                    "questionText": "Who was the first official GMC shelter caretaker?",
                    "choices": [
                        {
                            "text": "Clarence “Judge” Cowles at Taft Lodge"
                        },
                        {
                            "text": "Roy Buchanan at Buchanan Lodge"
                        },
                        {
                            "text": "Daan Zwick at Taft Lodge"
                        },
                        {
                            "text": "Edward Cooper at the Killington Huts"
                        }
                    ],
                    "correctAnswerIndex": 0,
                    "answerText": "Clarence Cowles was a Vermont probate judge and founding member of the Green Mountain Club.  In 1920, he supervised the construction of Taft Lodge on Mount Mansfield.  That summer he spent several weeks living in the lodge, becoming the first official caretaker.",
                    "answerImage": "https://www.greenmountainclub.org/wp-content/uploads/2020/06/1920-Taft-Lodge_Cowles.jpg\n",
                    "answerImageCaption": "Taft Lodge, 1920’s"
                },
                {
                    "id": "3481e5e8-91aa-4ff0-8271-755c7fe93673",
                    "tags": [
                        "SHELTERS",
                        "LONG TRAIL"
                    ],
                    "questionText": "How many women have had GMC shelters named for them?",
                    "choices": [
                        {
                            "text": "11"
                        },
                        {
                            "text": "4"
                        },
                        {
                            "text": "2"
                        },
                        {
                            "text": "0"
                        }
                    ],
                    "correctAnswerIndex": 1,
                    "answerText": "Four women have had shelters named for them: Lula Tye, Minerva Hinchey, Emily Proctor, and Laura Woodward.\nLaura Woodward and Emily Proctor have had their namesakes replaced, relocated, and rededicated multiple times.\nThe Lula Tye shelter was removed in 2011.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2023/08/Lula-Tye-jpg.webp",
                    "answerImageCaption": "Lula M.Tye, GMC Corresponding Secretary from 1925 to 1955"
                },
                {
                    "id": "4481e5e8-91aa-4ff0-8271-755c7fe93673",
                    "tags": [
                        "SHELTERS",
                        "LONG TRAIL"
                    ],
                    "questionText": "The largest and oldest Long Trail shelter is Taft Lodge on Mount Mansfield.  What is the smallest?",
                    "choices": [
                        {
                            "text": "Hazen’s Notch Camp"
                        },
                        {
                            "text": "Puffer Shelter"
                        },
                        {
                            "text": "Jay Camp"
                        },
                        {
                            "text": "Atlas Valley Shelter"
                        }
                    ],
                    "correctAnswerIndex": 3,
                    "answerText": "Located just north of route 242, this shelter is a small lean-to of plywood and plywood cores. It was built in 1967 by the Altas Plywood Division for the use of day hikers.  Maintained by the GMC, it houses no bunks, only a single small bench.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2023/04/Construction-of-Atlas-Valley-Shelter-1967-768x509.webp",
                    "answerImageCaption": "The Atlas Valley Shelter, shortly after construction in 1967"
                },
                {
                    "id": "1481e5e8-91aa-4ff0-8271-755c7fe93673",
                    "tags": [
                        "SHELTERS",
                        "LONG TRAIL"
                    ],
                    "questionText": "Cooper Lodge on Mount Killington is the highest LT shelter at 3,850 ft.  What is the lowest shelter on the Long Trail?",
                    "choices": [
                        {
                            "text": "Duck Brook Shelter"
                        },
                        {
                            "text": "Clarendon Shelter"
                        },
                        {
                            "text": "Corliss Camp"
                        },
                        {
                            "text": "Journey’s End Shelter"
                        }
                    ],
                    "correctAnswerIndex": 1,
                    "answerText": "Clarendon Shelter sits at 1350 ft above sea level. Duck Brook Shelter is at 670 ft, but is no longer on the Long Trail after the Winooski River trail relocation in 2015.",
                    "answerImage": "https://gmcburlington.org/wp-content/uploads/2023/04/cropped-Clarendon-Shlelter-2011.jpeg",
                    "answerImageCaption": "Clarendon Shelter, 2011"
                }
            ]
        }
    ]
};

const API_URL = "https://gmcburlington.org/wp-content/uploads/2023/10/";
 export const fetchTrivia = async (amount = 1): Promise<Trivia> => {
    //  console.log("API_URL: ", API_URL+"trivia.json");
    // const response = await fetch(API_URL+"trivia.json");
    // const trivia = await response.json();
    return  TriviaFactory(trivia);
};
