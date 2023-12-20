import React from "react";
import styles from "./styles.module.css";
import {
    EmailIcon,
    EmailShareButton,
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    TumblrIcon,
    TumblrShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";

interface SocialButtonsProps {
    message?: string;
    subject?: string;
}

const url = process.env.REACT_APP_URL || "http://localhost:3000";
const pageTitle = "Green Mountain Club - Burlington Section";
const SocialButtons = ({
                           subject = "Checkout my score on Trail Trivia",
                           message = "I just played Trail Trivia"
                       }: SocialButtonsProps) => {

    const emailMessage = `${message}! Check it out at ${url}`;
    return (<div className={styles.social_buttons}>
            <p className={styles.share_your_score}>Share your score!</p>
            <div className={styles.button_container}>
                <EmailShareButton url={url} subject={subject} body={emailMessage}>
                    <EmailIcon size={32} round={true}/>
                </EmailShareButton>
                <FacebookShareButton url={url}>
                    <FacebookIcon size={32} round={true}/>
                </FacebookShareButton>
                <LinkedinShareButton url={url} title={subject} summary={message} source={"GMCBurlington.org"}>
                    <LinkedinIcon size={32} round={true}/>
                </LinkedinShareButton>
                <RedditShareButton url={url} title={pageTitle}>
                    <RedditIcon size={32} round={true}/>
                </RedditShareButton>
                <TelegramShareButton url={url} title={pageTitle}>
                    <TelegramIcon size={32} round={true}/>
                </TelegramShareButton>
                <TumblrShareButton url={url}>
                    <TumblrIcon size={32} round={true}/>
                </TumblrShareButton>
                <TwitterShareButton url={url} title={subject}>
                    <TwitterIcon size={32} round={true}/>
                </TwitterShareButton>
                <WhatsappShareButton url={url} title={pageTitle}>
                    <WhatsappIcon size={32} round={true}/>
                </WhatsappShareButton>
            </div>
        </div>

    );

};

export default SocialButtons;