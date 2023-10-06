import { useState, useRef, useEffect } from 'react';
import { SetStat, Stat } from '../App';
import { rand } from '../Utils';

const girlNames = [
    "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn",
    "Abigail", "Emily", "Elizabeth", "Mila", "Ella", "Avery", "Sofia", "Camila", "Aria", "Scarlett",
    "Victoria", "Madison", "Luna", "Grace", "Chloe", "Penelope", "Layla", "Riley", "Zoey", "Nora",
    "Lily", "Eleanor", "Hannah", "Lillian", "Addison", "Aubrey", "Ellie", "Stella", "Natalie", "Zoe",
    "Leah", "Hazel", "Violet", "Aurora", "Savannah", "Audrey", "Brooklyn", "Bella", "Claire", "Skylar",
    "Lucy", "Paisley", "Everly", "Anna", "Caroline", "Nova", "Genesis", "Emilia", "Kennedy", "Samantha",
    "Maya", "Willow", "Kinsley", "Naomi", "Aaliyah", "Elena", "Ariana", "Allison", "Gabriella",
    "Alice", "Madelyn", "Cora", "Ruby", "Eva", "Serenity", "Autumn", "Adeline", "Hailey", "Gianna", "Valentina",
    "Isla", "Eliana", "Quinn", "Nevaeh", "Ivy", "Sadie", "Piper", "Lydia", "Alexa", "Josephine", "Emery", "Julia",
    "Delilah", "Arianna", "Vivian", "Kaylee", "Sophie", "Brielle", "Madeline", "Peyton", "Rylee", "Clara"
];

// List of unattractive bio for a girl in a dating app
const bioList = [
    "Partying all night and sleeping all day is my lifestyle. Looking for someone to buy me drinks and take me shopping.",
    "Just broke up with my ex. Looking for someone to help me get back at him. Drama queens need not apply.",
    "I don't really like talking. Don't message me if you're not a millionaire.",
    "Looking for a sugar daddy to fund my shopping sprees.",
    "I'm always the center of attention, and I need someone who can handle my drama 24/7.",
    "Single mom, devoted to her child. Looking for someone who can accept and embrace family life.",
    "Selfie queen and makeup guru. Love shopping and reality TV.",
    "I hate outdoor activities, and I'm allergic to animals.",
    "Looking for a sugar daddy to fund my lavish lifestyle. If you can't buy me designer bags, don't waste my time.",
    "I don't believe in monogamy; let's see how many people we can date at once!",
    "I'm obsessed with my ex, and I'm just here to make him jealous. Press the like button if you're okay with being part of my revenge plot.",
    "Obsessed with celebrity gossip and reality TV.",
    "I'm a mom of two adorable kids and looking for a partner who loves children.",
    "Like only if you're over 6 feet tall.",
    "Only interested in material possessions, flaunt wealth excessively, and lack empathy or concern for societal issues.",
    "Partying all night is my lifestyle. Looking for someone to keep up with my wild side.",
    "Selfie queen, obsessed with social media. Can't go anywhere without documenting every moment. Looking for someone to make my Insta famous.",
    "Proudly anti-science and anti-technology. I believe in conspiracy theories and reject modern scientific advancements.",
    "Looking for someone to take care of me and buy me expensive gifts. If you can't spoil me, don't bother.",
    "If you can't handle me at my worst, you don't deserve me at my best. Don't waste my time.",
    "I only date people of a certain race. If you don't fit the bill, don't bother.",
    "I expect perfection in every aspect of my life, and I won't settle for less. Only the best need apply.",
    "World traveler, millionaire entrepreneur, and supermodel. Swipe right if you can keep up with my glamorous lifestyle.",
    "Life is all about luxury and perfection. #InstaModel #Jetsetter #AlwaysFlawless"
];

const dialog = [
    "Hi there!",
    ">Nice to meet you!",
    // "Nice to meet you too!",
    // ">How are you?",
    "Let's meet at Burger King tomorrow at 17:00",
    ">Okay!",
    "I'll see you tomorrow!",
    // "I'm great!",
    // ">What do you do?",
    // "I'm a software engineer!",
    // ">What do you like?",
    // "I like to play video games!",
    // ">That sounds fun!",
    // "Do you have any hobbies?",
    // ">I like to read books!",
]

const saraIndex = 5;

export const DatingApp = ({ stat, setStat }: {
    stat: Stat;
    setStat: SetStat;
}) => {
    const { variables } = stat;
    const { setVariables } = setStat;

    const index = variables.dating_index !== undefined ? variables.dating_index : -1;
    const [tab, setTab] = useState("home");
    const isStarted = index >= 0;

    const datingAppRef = useRef<HTMLDivElement>(null);

    const getGirlCard = () => {
        return (<div key={index} className={`girl-card ${index === saraIndex ? "girl-card--sara" : ""}`}>
            <img className="girl-card__photo" src={`/phone/dating/${index < saraIndex ? `${index}.gif` : index === saraIndex ? "sara.png" : `${index - 1}.gif` }`} />
            <div className="girl-card__title">{index === saraIndex ? "Sara" : girlNames[index % (girlNames.length)]}, {index == saraIndex ? 20 : rand(28, 41, index)}</div>
            <div className="girl-card__bio">{index === saraIndex ? "SARA BIO" : bioList[index % (bioList.length)]}</div>
        </div>);
    };

    const [isTyping, setIsTyping] = useState(false);    

    const getMainApp = () => {
        const handleNext = () => {
            if (index === saraIndex) {
                setTimeout(() => {
                    setVariables(prev => ({...prev, sara_sent_first_message: true}));
                }, 5000);
            }

            setVariables({...variables, dating_index: index + 1});
        }

        const isSaraMessage = (message: string) => {
            return !message.startsWith(">");
        }

        const handleMessageSend = () => {
            if (messageIndex === dialog.length - 2) {
                setVariables(prev => ({...prev, sara_date_day: stat.day + 1}));
            }
            setVariables(prev => ({...prev, sara_message_index: messageIndex + 1}));
        }
               
        const messageIndex = Math.min(variables.sara_message_index || 0, dialog.length);
        const currentMessage = dialog[messageIndex] ?? "";

        console.log(messageIndex, dialog.length - 1);

        if (!(variables.sara_date_day && messageIndex === dialog.length) && variables.sara_sent_first_message && isSaraMessage(currentMessage) && !isTyping) {
            setIsTyping(true);

            setTimeout(() => {
                setIsTyping(false);
                setVariables(prev => ({...prev, sara_message_index: messageIndex + 1}));
            }, 4000);
        }

        return (<>
            <div className="dating-app__navigation-bar">
                <div onClick={() => setTab("home")} className={`dating-app__navigation-bar__btn-home ${tab === "home" ? "selected" : ""}`}>🏠</div>
                <div 
                    onClick={() => setTab("chat-list")} 
                    className={`dating-app__navigation-bar__btn-chat-list ${tab === "chat-list" ? "selected" : ""} ${variables.sara_sent_first_message && !variables.sara_first_message_seen ? "alert" : ""}`}
                >💬</div>
                <div onClick={() => setTab("profile")} className={`dating-app__navigation-bar__btn-profile ${tab === "profile" ? "selected" : ""}`}>{variables.username} 👤</div>
            </div>
            <div className={`dating-app__content ${tab}`}>
                {!!(tab === "home") && <>
                    {!!isStarted ? <>
                        {getGirlCard()}
                        <div className="btn-list">
                            <div className={`emoji btn-dislike ${index === saraIndex ? "unselectable" : ""}`} onClick={index === saraIndex ? undefined : handleNext}>👎🏻</div>
                            <div className="emoji btn-like" onClick={handleNext}>❤️</div>
                        </div>
                    </> : <>
                        <div className="dating-app__intro">
                            <button className="dating-app__intro__btn-start" onClick={() => setVariables({...variables, dating_index: 0})}>Start Search</button>
                            <div className="dating-app__intro__disclaimer">By pressing the 'Start Search' button, you confirm that you have read and agreed to our Terms of Service and Privacy Policy. You also certify that you are at least 18 years old and understand that using this dating app entails respectful and responsible interactions with other users.</div>
                        </div>
                    </>}
                </>}
                {!!(tab === "chat-list") && <div className="dating-app__chat-list">
                    {!!variables.sara_sent_first_message && 
                    <div className="chat-row" onClick={() => {
                        setVariables({...variables, sara_first_message_seen: true});
                        setTab("chat-sara");
                    }}>
                        <img className="chat-row__photo" src="/phone/dating/sara.png" />
                        <div className="chat-row__name">Sara</div>
                        <div className="chat-row__message">{variables.sara_message_index ? dialog[variables.sara_message_index - 1] : "You've got a match"}</div>
                    </div>}
                    
                </div>}
                {!!(tab === "chat-sara") && <div className="dating-app__chat">
                    <div className="dating-app__chat__header">
                        <img className="dating-app__chat__header__photo" src="/phone/dating/sara.png" />
                        <div className="dating-app__chat__header__name">Sara</div>
                    </div>
                    <div className="dating-app__chat__message-list">
                        <div className="dating-app__chat__match">You've got a match</div>
                        {dialog.slice(0, messageIndex).map((message, index) => 
                            isSaraMessage(message) ? <div className="chat-message sara" key={index}>{message}</div> : <div className="chat-message mine" key={index}>{message.replace(">", "")}</div>
                        )}
                        {!!(!isSaraMessage(currentMessage)) && <div className="chat-message unsent mine" onClick={handleMessageSend}>{currentMessage.replace(/>/g, "")}</div>}
                        {!!(isTyping || messageIndex === 0) && <div className="dating-app__chat__typing">Sara is typing</div>}
                    </div>
                </div>}
                {!!(tab === "profile") && <div className="dating-app__profile">
                    <h2>Profile</h2>
                    <div className="dating-app__profile__stats">
                        <div>Name</div><div>{variables.username}</div>
                        <div>Gender</div><div>Male</div>
                        <div>Age</div><div>{variables.age}</div>   
                    </div>
                </div> }
            </div>        
        </>)
    }

    const [name, setName] = useState("");
    const [age, setAge] = useState(0);
    const [error, setError] = useState("");
    const getRegistration = () => {

        const handleSubmit = () => {
            if (!name || name.length < 3) {
                setError("Please enter a valid name");
                return;
            }
            else if (!age || age < 18 || age > 99) {
                setError("Please enter a valid age");
                return;
            }
            setVariables({...variables, 
                username: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
                age: age,
            })
        }

        return <div className="dating-app__registration">
            <h2>Registration</h2>
            <fieldset>
                <legend>Gender</legend>
                <label><input type="radio" name="gender" checked={true} onChange={() => {}}/> Male</label>
                <label><input type="radio" name="gender" checked={false} onChange={() => {}}/> Female</label>
            </fieldset>
            <input type="text" placeholder='Name' onChange={e => setName(e.target.value.replace(/\s/g, ""))} value={name}/>
            <input type="number" placeholder='Age' min={1} max={99} value={age > 0 ? age : ""} onChange={e => setAge(Math.min(Math.max(parseInt(e.target.value), 1), 99))}/>
            <button onClick={handleSubmit}>Register</button>
            {!!error && <div className="dating-app__registration__error">{error}</div>}
        </div>
    }

    
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (datingAppRef.current) {
                const scrollableElement = datingAppRef.current;
                scrollableElement.scrollTo({
                    top: scrollableElement.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }, 100)

        return () => {
            clearTimeout(timeout);
        }
    });

    return (
        <div className="dating-app" ref={datingAppRef}>
            {!!(variables.username) ? getMainApp() : getRegistration()}
        </div>
    );
};
