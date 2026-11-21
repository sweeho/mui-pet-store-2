# Legacy implementation notes: customer-notifications

## User interface
No screen records were extracted for this capability; its user interface is unspecified.

## How the legacy application implements it
- Callers hand a text message to `AsyncSenderEJB.sendAMessage` (stateless session bean, local interface, unchecked method permission, transaction Required, session created transacted). It publishes one JMS text message to the queue `jms/AsyncSenderQueue`; any failure is wrapped in an EJBException and the connection is closed in `finally`.
- `MailerMDB` consumes the queue, parses the Mail XML (DTD `Mail(Address, Subject, Content)`, DTD-validating), and calls `MailHelper.createAndSendMail`, which looks up the container mail session, sets From from session config, parses recipients non-strictly, sets `X-Mailer: JavaMailer`, sent date now, content type text/html. The locale parameter is passed but never read.
- Send failures: `MailHelper` wraps into `MailerAppException`; the MDB swallows it ("user probably forgot to set up mail server"). Parse/JMS failures are rethrown as EJBException, causing rollback and redelivery with no visible limit (possible poison-message loop).
- OPC customer-relations MDBs (`MailOrderApprovalMDB`, `MailCompletedOrderMDB`, invoice mail) test a boolean env-entry flag (SendApprovalMail, SendConfirmationMail, SendCompletedOrderMail); `conf/petstore.properties` ships `opc.mail.send*=false`. They build the mail via `MailContentXDE`, which picks `<name>_<locale>.xsl` (en_US, ja_JP, zh_CN plus default). A missing locale sheet throws FormatterException and fails the message.
- Subjects: "Java Pet Store Order Status: <id>", "Java Pet Store Order Shipped: <id>", "Java Pet Store Order COMPLETED: <id>".

## Open points
- Flag naming differs between admin guide and XML; the enforcing code for NOTIF-RULE-0003 is outside the mailer module.
- Fallback to the default style sheet for unsupported locales is unverified.
- Transacted-session flag under a container-managed transaction is normally ignored; real effect is server dependent.
- Suspected defect: silent discard of send failures (NOTIF-RULE-0001).
