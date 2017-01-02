// Copyright 2016 Desmond Vehar.

'use strict';

// Env Variables:
// FLICKR_KEY - the public key for the flickr api

var request = require('request');
var cheerio = require('cheerio');
var RSVP = require('rsvp');

var APP_NAME = 'Motivate Me Test';
var PROD_APP_ID = 'amzn1.ask.skill.bd846ccf-84a7-4340-9249-5da185dfc1f7';
var TEST_APP_ID = 'amzn1.ask.skill.2bad9158-37e8-4b41-b534-2af458246d16';
var APP_ID_WHITELIST = [PROD_APP_ID, TEST_APP_ID];
var UNKNOWN = 'Unknown';

var QUOTES = [
    // From https://www.brainyquote.com/quotes/topics/topic_motivational.html
    'The past cannot be changed. The future is yet in your power.',
    'Never retreat. Never explain. Get it done and let them howl.',
    'When one must, one can.',
    'You have to make it happen.',
    'There is progress whether ye are going forward or backward! The thing is to move!',
    'Don\'t think, just do.',
    'March on. Do not tarry. To go forward is to move toward perfection. March on, and fear not the thorns, or the sharp stones on life\'s path.',
    'The first question which the priest and the Levite asked was: \'If I stop to help this man, what will happen to me?\' But... the good Samaritan reversed the question: \'If I do not stop to help this man, what will happen to him?\'',
    'Deserve your dream.',
    'Many are called but few get up.',
    'Set yourself earnestly to see what you are made to do, and then set yourself earnestly to do it.',
    'I\'d rather attempt to do something great and fail than to attempt to do nothing and succeed.',
    'Do whatever you do intensely.',
    'I like motivational books, because I like the go-getting American spirit - your destiny is in your own hands, life is what you make it, don\'t accept your limitations, jump before you\'re pushed, leap before you look.',
    'I like to put on hardcore when I have to clean my apartment, which I hate to do, but it\'s motivational. I like old heavy metal when I\'m outside working on my car. Music has definite functions for me.',
    'Success is the only motivational factor that a boy with character needs.',
    'Be thine own palace, or the world\'s thy jail.',
    'Determine never to be idle. No person will have occasion to complain of the want of time who never loses any. It is wonderful how much may be done if we are always doing.',
    'They can conquer who believe they can.',
    'The will to succeed is important, but what\'s more important is the will to prepare.',
    'Motivation will almost always beat mere talent.',
    'Motivation is the art of getting people to do what you want them to do because they want to do it.',
    'You must take action now that will move you towards your goals. Develop a sense of urgency in your life.',
    'You can\'t build a reputation on what you are going to do.',
    'Where there is a will, there is a way. If there is a chance in a million that you can do something, anything, to keep what you want from ending, do it. Pry the door open or, if need be, wedge your foot in that door and keep it open.',
    'Always desire to learn something useful.',
    'Be kind whenever possible. It is always possible.',
    'Change your life today. Don\'t gamble on the future, act now, without delay.',
    'Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.',
    'Wherever you are - be all there.',
    'Consult not your fears but your hopes and your dreams. Think not about your frustrations, but about your unfulfilled potential. Concern yourself not with what you tried and failed in, but with what it is still possible for you to do.',
    'Do the difficult things while they are easy and do the great things while they are small. A journey of a thousand miles must begin with a single step.',
    'We may encounter many defeats but we must not be defeated.',
    'Things do not happen. Things are made to happen.',
    'Set your sights high, the higher the better. Expect the most wonderful things to happen, not in the future but right now. Realize that nothing is too good. Allow absolutely nothing to hamper you or hold you up in any way.',
    'Ever tried. Ever failed. No matter. Try Again. Fail again. Fail better.',
    'Only I can change my life. No one can do it for me.',
    'Never, never, never give up.',
    'I know where I\'m going and I know the truth, and I don\'t have to be what you want me to be. I\'m free to be what I want.',
    'The way to get started is to quit talking and begin doing.',
    'You can never quit. Winners never quit, and quitters never win.',
    'The key is to keep company only with people who uplift you, whose presence calls forth your best.',
    'What you get by achieving your goals is not as important as what you become by achieving your goals.',
    'If you\'re going through hell, keep going.',
    'Look up at the stars and not down at your feet. Try to make sense of what you see, and wonder about what makes the universe exist. Be curious.',
    'Never give up, for that is just the place and time that the tide will turn.',
    'When you reach the end of your rope, tie a knot in it and hang on.',
    'You are not here merely to make a living. You are here in order to enable the world to live more amply, with greater vision, with a finer spirit of hope and achievement. You are here to enrich the world, and you impoverish yourself if you forget the errand.',
    'If you don\'t like how things are, change it! You\'re not a tree.',
    'Decide what you want, decide what you are willing to exchange for it. Establish your priorities and go to work.',
    'Either you run the day or the day runs you.',
    'I learned that we can do anything, but we can\'t do everything... at least not at the same time. So think of your priorities not in terms of what activities you do, but when you do them. Timing is everything.',
    'The harder the conflict, the more glorious the triumph.',
    'Act as if what you do makes a difference. It does.',
    'Earl Nightingale has inspired more people toward success and fortune than any other motivational speaker on the planet.',
    'To know oneself, one should assert oneself.',
    'Do something wonderful, people may imitate it.',
    'Expect problems and eat them for breakfast.',
    'Never complain and never explain.',
    'Well done is better than well said.',
    'To be a good loser is to learn how to win.',
    'We aim above the mark to hit the mark.',
    'Hitch your wagon to a star.',
    'Learning is the beginning of wealth. Learning is the beginning of health. Learning is the beginning of spirituality. Searching and learning is where the miracle process all begins.',
    'Who seeks shall find.',
    'Every exit is an entry somewhere else.',
    'Either I will find a way, or I will make one.',
    'There is nothing deep down inside us except what we have put there ourselves.',
    'Pursue one great decisive aim with force and determination.',
    'The weeds keep multiplying in our garden, which is our mind ruled by fear. Rip them out and call them by name.',
    'No matter how many goals you have achieved, you must set your sights on a higher one.',
    'The turning point was when I hit my 30th birthday. I thought, if really want to write, it\'s time to start. I picked up the book How to Write a Novel in 90 Days. The author said to just write three pages a day, and I figured, I can do this. I never got past Page 3 of that book.',
    'One of the things that I did before I ran for president is I was a professional speaker. Not a motivational speaker - an inspirational speaker. Motivation comes from within. You have to be inspired. That\'s what I do. I inspire people, I inspire the public, I inspire my staff. I inspired the organizations I took over to want to succeed.',
    'I\'m thrilled to continue my partnership with U by Kotex for Generation Know while helping to empower girls. I\'ve always been a motivational resource for my younger sisters and hope I can positively impact and inspire other young girls too.',
    'The most effective way to do it, is to do it.',
    'There is always room at the top.',
    'I really believe that everyone has a talent, ability, or skill that he can mine to support himself and to succeed in life.',
    'Do your work with your whole heart, and you will succeed - there\'s so little competition.',
    'The people who influence you are the people who believe in you.',
    'We are taught you must blame your father, your sisters, your brothers, the school, the teachers - but never blame yourself. It\'s never your fault. But it\'s always your fault, because if you wanted to change you\'re the one who has got to change.',
    'After a storm comes a calm.',
    'When something is important enough, you do it even if the odds are not in your favor.',
    'The more we do, the more we can do.',
    'I am not afraid... I was born to do this.',
    'I\'ve worked too hard and too long to let anything stand in the way of my goals. I will not let my teammates down and I will not let myself down.',
    'Set your goals high, and don\'t stop till you get there.',
    'You can\'t wait for inspiration. You have to go after it with a club.',
    'You simply have to put one foot in front of the other and keep going. Put blinders on and plow right ahead.',
    'Perseverance is not a long race; it is many short races one after the other.',
    'If you don\'t design your own life plan, chances are you\'ll fall into someone else\'s plan. And guess what they have planned for you? Not much.',
    'He conquers who endures.',
    'Even if you fall on your face, you\'re still moving forward.',
    'No bird soars too high if he soars with his own wings.',
    'Don\'t give up. Don\'t lose hope. Don\'t sell out.',
    'By failing to prepare, you are preparing to fail.',
    'A goal is a dream with a deadline.',
    'God always strives together with those who strive.',
    'Be miserable. Or motivate yourself. Whatever has to be done, it\'s always your choice.',
    'Never give in and never give up.',
    'There is no passion to be found playing small - in settling for a life that is less than the one you are capable of living.',
    'There\'s a way to do it better - find it.',
    'Learn from the past, set vivid, detailed goals for the future, and live in the only moment of time over which you have any control: now.',
    'The hardships that I encountered in the past will help me succeed in the future.',
    'Without hard work, nothing grows but weeds.',
    'It\'s always too early to quit.',
    'We make the world we live in and shape our own environment.',
    'Your talent is God\'s gift to you. What you do with it is your gift back to God.',
    'You are never too old to set another goal or to dream a new dream.',
    'If you want to conquer fear, don\'t sit home and think about it. Go out and get busy.',
    'A good plan violently executed now is better than a perfect plan executed next week.',
    'You just can\'t beat the person who never gives up.',
    'Perseverance is failing 19 times and succeeding the 20th.',
    'The more man meditates upon good thoughts, the better will be his world and the world at large.',
    'I\'ve found that luck is quite predictable. If you want more luck, take more chances. Be more active. Show up more often.',
    'Aim for the moon. If you miss, you may hit a star.',
    'If you think you can do it, you can.',
    'Go for it now. The future is promised to no one.',
    'I attribute my success to this - I never gave or took any excuse.',
    'Knowing is not enough; we must apply. Willing is not enough; we must do.',
    'I don\'t believe you have to be better than everybody else. I believe you have to be better than you ever thought you could be.',
    'Beginning today, treat everyone you meet as if they were going to be dead by midnight. Extend to them all the care, kindness and understanding you can muster, and do it with no thought of any reward. Your life will never be the same again.',
    'Do the one thing you think you cannot do. Fail at it. Try again. Do better the second time. The only people who never tumble are those who never mount the high wire. This is your moment. Own it.',
    'Do not wait to strike till the iron is hot; but make it hot by striking.',
    'If you fell down yesterday, stand up today.',
    'The more things you do, the more you can do.',
    'The first step toward success is taken when you refuse to be a captive of the environment in which you first find yourself.',
    'Be Impeccable With Your Word. Speak with integrity. Say only what you mean. Avoid using the word to speak against yourself or to gossip about others. Use the power of your word in the direction of truth and love.',
    'When you fail you learn from the mistakes you made and it motivates you to work even harder.',
    'The ultimate aim of the ego is not to see something, but to be something.',
    'Whatever you want in life, other people are going to want it too. Believe in yourself enough to accept the idea that you have an equal right to it.',
    'Only the educated are free.',
    'Either move or be moved.',
    'You can\'t expect to hit the jackpot if you don\'t put a few nickels in the machine.',
    'What is called genius is the abundance of life and health.',
    'True happiness involves the full use of one\'s power and talents.',
    'I am not a has-been. I am a will be.',
    'I can, therefore I am.',
    'If you don\'t ask, you don\'t get.',
    'One may miss the mark by aiming too high as too low.',
    'Do you want to know who you are? Don\'t ask. Act! Action will delineate and define you.',
    'If you\'ve got a talent, protect it.',
    'Go big or go home. Because it\'s true. What do you have to lose?',
    'Crave for a thing, you will get it. Renounce the craving, the object will follow you by itself.',
    'I was motivated to be different in part because I was different.',
    'I\'m going to write a book, continue acting, continue motivational speaking and just share with people who I am and what I\'ve learned in my second chance of life and pass it on to people in their first chance of life.',
    'Big shots are only little shots who keep shooting.',
    'Small deeds done are better than great deeds planned.',
    'Opportunity does not knock, it presents itself when you beat down the door.',
    'I\'ve always tried to go a step past wherever people expected me to end up.',
    'Leap, and the net will appear.',
    'In motivating people, you\'ve got to engage their minds and their hearts. I motivate people, I hope, by example - and perhaps by excitement, by having productive ideas to make others feel involved.',
    'You create your opportunities by asking for them.',
    'Poverty was the greatest motivating factor in my life.',
    'I started doing motivational tours. I\'ve seen all kinds of people, from the CEOs to the lowest executive, opening up to their fears. We don\'t introspect as much as we should.',
    'Know or listen to those who know.',
    'Always continue the climb. It is possible for you to do whatever you choose, if you first get to know who you are and are willing to work with a power that is greater than ourselves to do it.',
    'If you ask me what I came into this life to do, I will tell you: I came to live out loud.',
    'Don\'t fight the problem, decide it.',
    'You need to overcome the tug of people against you as you reach for high goals.',
    'You will never win if you never begin.',
    'If you want to succeed you should strike out on new paths, rather than travel the worn paths of accepted success.',
    'Arriving at one goal is the starting point to another.',
    'One way to keep momentum going is to have constantly greater goals.',
    'Your heaviest artillery will be your will to live. Keep that big gun going.',
    'Be gentle to all and stern with yourself.',
    'Get action. Seize the moment. Man was never intended to become an oyster.',
    'Begin to be now what you will be hereafter.',
    'To begin, begin.',
    'Follow your inner moonlight; don\'t hide the madness.',
    'I think people who are creative are the luckiest people on earth. I know that there are no shortcuts, but you must keep your faith in something Greater than You, and keep doing what you love. Do what you love, and you will find the way to get it out to the world.',
    'A will finds a way.',
    'Step by step and the thing is done.',
    'One finds limits by pushing them.',
    'Press forward. Do not stop, do not linger in your journey, but strive for the mark set before you.',
    'Follow your dreams, work hard, practice and persevere. Make sure you eat a variety of foods, get plenty of exercise and maintain a healthy lifestyle.',
    'You never know what motivates you.',
    'It is very important to know who you are. To make decisions. To show who you are.',
    'My first book was called, \'Mountain, Get Out of My Way,\' where I did an autobiographical sketch, if you will, looking back at myself and looking back at things in my life, and juxtaposing them against things that are happening in other people\'s lives and trying to be motivational.',
    'We need to accept that the commandments of God aren\'t just a long list of good ideas. They aren\'t \'life hacks\' from an Internet blog or motivational quotes from a Pinterest board.',
    'I went to a motivational training course once, a course of self-discovery, and I found out after a week that my fear - it was not a fear of not being accepted - was a very violent fear of failure.',
    'Religious speech is extreme, emotional, and motivational. It is anti-literal, relying on metaphor, allusion, and other rhetorical devices, and it assumes knowledge within a community of believers.',
    'Marvin\'s Motivational Moments actually started as something that was actually therapeutic for me. I would sit up late at night after my wife passed trying to adjust to being alone.',
    'Life is 10% what happens to you and 90% how you react to it.',
    'Infuse your life with action. Don\'t wait for it to happen. Make it happen. Make your own future. Make your own hope. Make your own love. And whatever your beliefs, honor your creator, not by passively waiting for grace to come down from upon high, but by doing what you can to make grace happen... yourself, right now, right down here on Earth.',
    'Good, better, best. Never let it rest. \'Til your good is better and your better is best.',
    'With the new day comes new strength and new thoughts.',
    'Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.',
    'In order to succeed, we must first believe that we can.',
    'Keep your eyes on the stars, and your feet on the ground.',
    'Quality is not an act, it is a habit.',
    'It always seems impossible until it\'s done.',
    'Failure will never overtake me if my determination to succeed is strong enough.',
    'Always do your best. What you plant now, you will harvest later.',
    'You can\'t cross the sea merely by standing and staring at the water.',
    'If you can dream it, you can do it.',
    'Don\'t watch the clock; do what it does. Keep going.',
    'The secret of getting ahead is getting started.',
    'A creative man is motivated by the desire to achieve, not by the desire to beat others.',
    'We should not give up and we should not allow the problem to defeat us.',
    'What you do today can improve all your tomorrows.',
    'Believe in yourself! Have faith in your abilities! Without a humble but reasonable confidence in your own powers you cannot be successful or happy.',
    'Setting goals is the first step in turning the invisible into the visible.',
    'Problems are not stop signs, they are guidelines.',
    'Start where you are. Use what you have. Do what you can.',
    'Accept the challenges so that you can feel the exhilaration of victory.',
    'There is only one corner of the universe you can be certain of improving, and that\'s your own self.',
    'It does not matter how slowly you go as long as you do not stop.',
    'The will to win, the desire to succeed, the urge to reach your full potential... these are the keys that will unlock the door to personal excellence.',
    'A somebody was once a nobody who wanted to and did.',
    'I come to win.',
    'To be wholly devoted to some intellectual exercise is to have succeeded in life.',
    'I know not age, nor weariness nor defeat.',
    'Giving back, doing motivational speeches and stuff like that, that\'s always made me feel good. If you repeatedly go out there, and you are the change that you want to see, then that\'s what you are.',
    'The wise does at once what the fool does at last.',
    'Do not wait; the time will never be \'just right.\' Start where you stand, and work with whatever tools you may have at your command, and better tools will be found as you go along.',
    'The dog that trots about finds a bone.',
    'Give Obama a script he has made his own, and he is the motivational speaker to end all speakers. Tony Robbins cloned with Honest Abe.',
    'People always accuse me of being motivational in a way, like it was a bad thing, but that\'s just how I was raised. My mom raised me in a positive environment, with lots of love in my heart, and that reflects in my music.',
    'Typically, if you reward something, you get more of it. You punish something, you get less of it. And our businesses have been built for the last 150 years very much on that kind of motivational scheme.',
    'I believe that any type of education can be great, but an education about ourselves can create something wonderful. I am a comedian, but people have called me a motivational speaker. I don\'t really consider myself that at all.',
    'From my tribe I take nothing, I am the maker of my own fortune.',
    'You have to learn the rules of the game. And then you have to play better than anyone else.',
    'I realized I love motivating and I love empowering and I love inspiring people. I did that as an athlete for 18 years, and I am able to do that as a motivational speaker now as well as doing work on television.',
    'Oh, I would love to be a motivational speaker. I have pulled myself out of a million potholes, and I can see the potholes ahead of me. That doesn\'t mean that I could always do that so perfectly for my own life. I totally fall in potholes.',
    'I\'ve always thought of acting as more of an exercise in empathy, which is not to be confused with sympathy. You\'re trying to get inside a certain emotional reality or motivational reality and try to figure out what that\'s about so you can represent it.',
    'How do you know you\'re going to do something, untill you do it?',
    'Do not weep; do not wax indignant. Understand.',
    'Our subliminal mental processes operate outside awareness because they arise in these portions of our mind that are inaccessible to our conscious self; their inaccessibility is due to the architecture of the brain rather than because they have been subject to Freudian motivational forces like repression.',
    'I\'m a motivational speaker.',
    'As long as I\'m not selling out the people that ride or die with me, I\'m glad I\'m not an MC. I\'m a motivational speaker. I\'m not that rapper dude.',
    'I don\'t know what it\'s like to have a typical father figure. He\'s not the dad who\'s going to take me to the beach and go swimming, but he\'s such a motivational person.',
    'I want to be motivational and inspirational for everybody: my big aim is more women on bicycles.',
    'One day, I got so disgusted that I sat down and wrote a list called \'Justin\'s list of things to do before he kicks the bucket.\' I wrote it for myself and shortened it to \'Justin\'s Bucket List.\' It was there on the wall, not as a story idea but as a motivational tool for myself, which actually ended up working pretty well.',
    'Life is 10% what happens to you and 90% how you react to it.',
    'Infuse your life with action. Don\'t wait for it to happen. Make it happen. Make your own future. Make your own hope. Make your own love. And whatever your beliefs, honor your creator, not by passively waiting for grace to come down from upon high, but by doing what you can to make grace happen... yourself, right now, right down here on Earth.',
    'Good, better, best. Never let it rest. \'Til your good is better and your better is best.',
    'With the new day comes new strength and new thoughts.',
    'Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.',
    'In order to succeed, we must first believe that we can.',
    'Keep your eyes on the stars, and your feet on the ground.',
    'Quality is not an act, it is a habit.',
    'It always seems impossible until it\'s done.',
    'Failure will never overtake me if my determination to succeed is strong enough.',
    'Always do your best. What you plant now, you will harvest later.',
    'You can\'t cross the sea merely by standing and staring at the water.',
    'If you can dream it, you can do it.',
    'Don\'t watch the clock; do what it does. Keep going.',
    'The secret of getting ahead is getting started.',
    'A creative man is motivated by the desire to achieve, not by the desire to beat others.',
    'We should not give up and we should not allow the problem to defeat us.',
    'What you do today can improve all your tomorrows.',
    'Believe in yourself! Have faith in your abilities! Without a humble but reasonable confidence in your own powers you cannot be successful or happy.',
    'Setting goals is the first step in turning the invisible into the visible.',
    'Problems are not stop signs, they are guidelines.',
    'Start where you are. Use what you have. Do what you can.',
    'Accept the challenges so that you can feel the exhilaration of victory.',
    'There is only one corner of the universe you can be certain of improving, and that\'s your own self.',
    'It does not matter how slowly you go as long as you do not stop.',
    'The will to win, the desire to succeed, the urge to reach your full potential... these are the keys that will unlock the door to personal excellence.',
    // From http://quotelicious.com/quotes/motivational-quotes
    'If you can’t stop thinking about it, don’t stop working for it.',
    // From http://www.quotationspage.com/random.php3
    'Never regret. If it\'s good, it\'s wonderful. If it\'s bad, it\'s experience.'
];

var AUTHORS = [
    // From https://www.brainyquote.com/quotes/topics/topic_motivational.html
    'Unknown',
    'Benjamin Jowett',
    'Charlotte Whitton',
    'Denis Diderot',
    'Edgar Cayce',
    'Horace',
    'Khalil Gibran',
    'Martin Luther King, Jr.',
    'Octavio Paz',
    'Oliver Herford',
    'Phillips Brooks',
    'Robert H. Schuller',
    'Robert Henri',
    'Louise Mensch',
    'Peter Steele',
    'Woody Hayes',
    'John Donne',
    'Thomas Jefferson',
    'Virgil',
    'Bobby Knight',
    'Norman Ralph Augustine',
    'Dwight D. Eisenhower',
    'H. Jackson Brown, Jr.',
    'Henry Ford',
    'Pauline Kael',
    'Sophocles',
    'Dalai Lama',
    'Simone de Beauvoir',
    'Thomas A. Edison',
    'Jim Elliot',
    'Pope John XXIII',
    'Lao Tzu',
    'Maya Angelou',
    'John F. Kennedy',
    'Eileen Caddy',
    'Samuel Beckett',
    'Carol Burnett',
    'Winston Churchill',
    'Muhammad Ali',
    'Walt Disney',
    'Ted Turner',
    'Epictetus',
    'Zig Ziglar',
    'Winston Churchill',
    'Stephen Hawking',
    'Harriet Beecher Stowe',
    'Franklin D. Roosevelt',
    'Woodrow Wilson',
    'Jim Rohn',
    'H. L. Hunt',
    'Jim Rohn',
    'Dan Millman',
    'Thomas Paine',
    'William James',
    'Zig Ziglar',
    'Albert Camus',
    'Albert Schweitzer',
    'Alfred A. Montapert',
    'Benjamin Disraeli',
    'Benjamin Franklin',
    'Carl Sandburg',
    'Ralph Waldo Emerson',
    'Ralph Waldo Emerson',
    'Jim Rohn',
    'Sophocles',
    'Tom Stoppard',
    'Philip Sidney',
    'Richard Rorty',
    'Carl von Clausewitz',
    'Sylvia Browne',
    'Jessica Savitch',
    'James Rollins',
    'Herman Cain',
    'Khloe Kardashian',
    'Amelia Earhart',
    'Daniel Webster',
    'Dean Koontz',
    'Elbert Hubbard',
    'Henry Drummond',
    'Katharine Hepburn',
    'Matthew Henry',
    'Elon Musk',
    'William Hazlitt',
    'Joan of Arc',
    'Mia Hamm',
    'Bo Jackson',
    'Jack London',
    'George Lucas',
    'Walter Elliot',
    'Jim Rohn',
    'Persius',
    'Victor Kiam',
    'William Blake',
    'Christopher Reeve',
    'Benjamin Franklin',
    'Napoleon Hill',
    'Aeschylus',
    'Wayne Dyer',
    'Hubert H. Humphrey',
    'Nelson Mandela',
    'Thomas A. Edison',
    'Denis Waitley',
    'Philip Emeagwali',
    'Gordon B. Hinckley',
    'Norman Vincent Peale',
    'Orison Swett Marden',
    'Leo Buscaglia',
    'Les Brown',
    'Dale Carnegie',
    'George S. Patton',
    'Babe Ruth',
    'Julie Andrews',
    'Confucius',
    'Brian Tracy',
    'W. Clement Stone',
    'John Burroughs',
    'Wayne Dyer',
    'Florence Nightingale',
    'Johann Wolfgang von Goethe',
    'Ken Venturi',
    'Og Mandino',
    'Oprah Winfrey',
    'William Butler Yeats',
    'H. G. Wells',
    'Lucille Ball',
    'Mark Caine',
    'Don Miguel Ruiz',
    'Natalie Gulbis',
    'Muhammad Iqbal',
    'Diane Sawyer',
    'Epictetus',
    'Ezra Pound',
    'Flip Wilson',
    'Henry David Thoreau',
    'John W. Gardner',
    'Lauren Bacall',
    'Simone Weil',
    'Stevie Wonder',
    'Thomas Fuller',
    'Thomas Jefferson',
    'Jim Carrey',
    'Eliza Dushku',
    'Swami Sivananda',
    'Donna Brazile',
    'J. R. Martinez',
    'Christopher Morley',
    'Peter Marshall',
    'Kyle Chandler',
    'Beverly Sills',
    'John Burroughs',
    'Rupert Murdoch',
    'Shakti Gawain',
    'Jimmy Dean',
    'Anupam Kher',
    'Baltasar Gracian',
    'Ella Wheeler Wilcox',
    'Emile Zola',
    'George C. Marshall',
    'George S. Patton',
    'Helen Rowland',
    'John D. Rockefeller',
    'John Dewey',
    'Michael Korda',
    'Norman Cousins',
    'Saint Teresa of Avila',
    'Theodore Roosevelt',
    'William James',
    'William Wordsworth',
    'Allen Ginsberg',
    'Judy Collins',
    'Orison Swett Marden',
    'Charles Atlas',
    'Herbert Simon',
    'George Whitefield',
    'Sasha Cohen',
    'Cicely Tyson',
    'Malala Yousafzai',
    'Montel Williams',
    'Dieter F. Uchtdorf',
    'Emanuel Steward',
    'Amy Waldman',
    'Marvin Sapp',
    'Charles R. Swindoll',
    'Bradley Whitford',
    'St. Jerome',
    'Eleanor Roosevelt',
    'Helen Keller',
    'Nikos Kazantzakis',
    'Theodore Roosevelt',
    'Aristotle',
    'Nelson Mandela',
    'Og Mandino',
    'Og Mandino',
    'Rabindranath Tagore',
    'Walt Disney',
    'Sam Levenson',
    'Mark Twain',
    'Ayn Rand',
    'A. P. J. Abdul Kalam',
    'Ralph Marston',
    'Norman Vincent Peale',
    'Tony Robbins',
    'Robert H. Schuller',
    'Arthur Ashe',
    'George S. Patton',
    'Aldous Huxley',
    'Confucius',
    'Confucius',
    'John Burroughs',
    'Leo Durocher',
    'Robert Louis Stevenson',
    'Rose Kennedy',
    'Keke Palmer',
    'Baltasar Gracian',
    'George Herbert',
    'Golda Meir',
    'Tina Brown',
    'Lenny Kravitz',
    'Daniel H. Pink',
    'Andy Andrews',
    'Tecumseh',
    'Unknown',
    'Dominique Dawes',
    'Drew Barrymore',
    'Edward Norton',
    'J. D. Salinger',
    'Baruch Spinoza',
    'Leonard Mlodinow',
    'Young Jeezy',
    'Young Jeezy',
    'Tiffany Trump',
    'Marianne Vos',
    'Justin Zackham',
    'Charles R. Swindoll',
    'Bradley Whitford',
    'St. Jerome',
    'Eleanor Roosevelt',
    'Helen Keller',
    'Nikos Kazantzakis',
    'Theodore Roosevelt',
    'Aristotle',
    'Nelson Mandela',
    'Og Mandino',
    'Og Mandino',
    'Rabindranath Tagore',
    'Walt Disney',
    'Sam Levenson',
    'Mark Twain',
    'Ayn Rand',
    'A. P. J. Abdul Kalam',
    'Ralph Marston',
    'Norman Vincent Peale',
    'Tony Robbins',
    'Robert H. Schuller',
    'Arthur Ashe',
    'George S. Patton',
    'Aldous Huxley',
    'Confucius',
    'Confucius',
    // From http://quotelicious.com/quotes/motivational-quotes
    UNKNOWN,
    // From http://www.quotationspage.com/random.php3
    'Victoria Holt'
];

// From a Flick API call to get the favorites from my account:
// https://api.flickr.com/services/rest/?&method=flickr.favorites.getList&per_page=500&page=1&api_key={process.env.FLICKR_KEY}&user_id=48889646@N07
var IMAGES = [
    // farm id, server id, photo id, photo secret
    [3, 2045, 2867425266, '6baac16b44']
];

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        // Prevent someone else from configuring a skill that sends request to this lambda
        if (APP_ID_WHITELIST.indexOf(event.session.application.applicationId) == -1) {
            context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            var responseValues = onLaunch(event.request, event.session);
            context.succeed(buildResponse(responseValues));
        } else if (event.request.type === "IntentRequest") {
            var responseValues = onIntent(event.request, event.session);
            context.succeed(buildResponse(responseValues));
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var quote = getRandomMotivationalQuote();
    var cardSsml = new SSML();
    cardSsml
        .openSpeakTag()
        .openParagraphTag()
        .addPlainText(quote.quote)
        .closeParagraphTag()
        .addPlainText(quote.author)
        .closeSpeakTag();
    var cardText = getCardText(quote);
    var photoUrl = getRandomImageUrl();
    var cardTitle = APP_NAME + "!";
    return {
        sessionAttributes: session.attributes,
        speechletResponse: buildSpeechletResponseWithImage(cardTitle, cardSsml.toString(), cardText, photoUrl, "", "true")
    };
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId
        + ", intentName=" + intentRequest.intent.name);

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == 'GetRandomMotivationQuote') {
        return handleIntentGetRandomMotivationQuote(intent, session);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function handleIntentGetRandomMotivationQuote(intent, session) {
    var quote = getRandomMotivationalQuote();
    var cardSsml = new SSML();
    cardSsml
        .openSpeakTag()
        .openParagraphTag()
        .addPlainText(quote.quote)
        .closeParagraphTag()
        .addPlainText(quote.author)
        .closeSpeakTag();
    var cardText = getCardText(quote);
    var photoUrl = getRandomImageUrl();
    var cardTitle = APP_NAME + "!";
    return {
        sessionAttributes: session.attributes,
        speechletResponse: buildSpeechletResponseWithImage(cardTitle, cardSsml.toString(), cardText, photoUrl, "", "true")
    };
}

// ------- Helper functions to fetch quotes -------

function getRandomMotivationalQuote () {
    var randomIdx = Math.floor(Math.random() * QUOTES.length);
    var quote = QUOTES[randomIdx];
    var author = AUTHORS[randomIdx];

    return {
        quote: quote,
        author: author
    };
}

// ------- FLICKR Helper -------

function getFlickrUrl (farmId, serverId, photoId, photoSecret) {
    return 'https://farm' + farmId + '.staticflickr.com/' + serverId + '/' + photoId + '_' + photoSecret + '.jpg';
}

// fetch a random picture from https://www.flickr.com/photos/48889646@N07/favorites via the Flickr API
function getRandomImageUrl () {
    var randomIdx = Math.floor(Math.random() * IMAGES.length);
    var imageData = IMAGES[randomIdx];

    return getFlickrUrl(imageData[0], imageData[1], imageData[2], imageData[3]);
}

// ------- SSML Helper -------

function SSML() {
    this.text = '';
}
SSML.prototype.openSpeakTag = function () { this.text += '<speak>'; return this; };
SSML.prototype.closeSpeakTag = function () { this.text += '</speak>'; return this; };
SSML.prototype.openParagraphTag = function () { this.text += '<p>'; return this; };
SSML.prototype.closeParagraphTag = function () { this.text += '</p>'; return this; };
SSML.prototype.addPlainText = function (text) { this.text += text; return this; };
SSML.prototype.addStrongBreak = function () { this.text += '<break strength="strong"/>'; return this; };
SSML.prototype.toString = function () { return this.text; };

// ------- Card Text Helper -------

function getCardText(quote) {
    return '"' + quote.quote + '"\n - ' + quote.author;
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, cardText, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Simple",
            title: title,
            content: cardText
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithImage(title, output, cardText, cardImageUrl, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Standard",
            title: title,
            text: cardText,
            image: {
                smallImageUrl: cardImageUrl,
                largeImageUrl: cardImageUrl
            }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(responseValues) {
    return {
        version: "1.0",
        sessionAttributes: responseValues.sessionAttributes,
        response: responseValues.speechletResponse
    };
}
