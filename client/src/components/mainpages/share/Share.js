import React from 'react'
import {
  EmailShareButton, EmailIcon,
  FacebookShareButton, FacebookIcon,
  FacebookMessengerShareButton, FacebookMessengerIcon,
  TelegramShareButton, TelegramIcon,
  TwitterShareButton, TwitterIcon,
  WhatsappShareButton, WhatsappIcon,
  RedditShareButton, RedditIcon
} from 'react-share'

const Share = ({url}) => {
  return (
    <div className='share res-row'>
        <span>Chia sẻ:</span>
        <div className='share-btn'>
            <FacebookMessengerShareButton url={url} appId='801272917769899'>
                <FacebookMessengerIcon round={true} size={32}/>
            </FacebookMessengerShareButton>

            <FacebookShareButton url={url}>
                <FacebookIcon round={true} size={32} />
            </FacebookShareButton>

            <TwitterShareButton url={url}>
                <TwitterIcon round={true} size={32} />
            </TwitterShareButton>

            <EmailShareButton url={url}>
                <EmailIcon round={true} size={32} />
            </EmailShareButton>

            <RedditShareButton url={url}>
                <RedditIcon round={true} size={32} />
            </RedditShareButton>

            <TelegramShareButton url={url}>
                <TelegramIcon round={true} size={32} />
            </TelegramShareButton>

            <WhatsappShareButton url={url}>
                <WhatsappIcon round={true} size={32} />
            </WhatsappShareButton>
        </div>
    </div>
  )
}

export default Share
