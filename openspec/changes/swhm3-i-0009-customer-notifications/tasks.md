## 1. Mail request model

- [ ] 1.1 Define the mail request (address, subject, content, all text, in that order)
- [ ] 1.2 Define the outgoing e-mail document representation

## 2. Queue hand-off

- [ ] 2.1 Implement publishing of a text message to the asynchronous queue
- [ ] 2.2 Report enqueue failure to the caller and always release the connection
- [ ] 2.3 Make the enqueue join the caller's transaction
- [ ] 2.4 Allow any in-application caller without a role check

## 3. Mail consumption and delivery

- [ ] 3.1 Consume mail requests from the queue and send one e-mail per message
- [ ] 3.2 Send HTML e-mail with configured sender, current sent date and X-Mailer header
- [ ] 3.3 Discard undeliverable mail without retry and without failing the caller transaction
- [ ] 3.4 Raise a system error for malformed messages so they are redelivered

## 4. Order-status e-mails

- [ ] 4.1 Add per-kind enable switches (confirmation, approval, completed), default off
- [ ] 4.2 Address mail to the purchase order e-mail with the three subject formats
- [ ] 4.3 Render bodies by order locale with locale-specific templates
