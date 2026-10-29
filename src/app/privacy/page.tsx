import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Continua',
  description: 'Continua Privacy Policy — what information we collect, how we use it, and your choices.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-[720px] lg:max-w-[960px] mx-auto px-6 pt-20 pb-12">
      <h1 className="text-[32px] font-bold mb-2">Privacy Policy</h1>
      <p className="text-[14px] mb-8 opacity-70">Continua | Effective Date: October 20, 2026</p>

      <div className="text-[18px] md:text-[20px] leading-[1.6] space-y-8">
        <p>
            Continua (“Continua,” “we,” “our,” or “us”) respects your privacy. This Privacy Policy explains what information we collect when you use continua.info and related Continua services, how we use and disclose that information, how long we retain it, and the choices you may have regarding your information.
          </p>
        <p>
            Continua is a self-reflection and educational tool. It is not a clinical, diagnostic, medical, or therapeutic service.
          </p>

        <section>
          <h2 className="text-[24px] font-bold mb-3">1. Information We Collect</h2>
          <p>
            The information we collect depends on how you use Continua.
          </p>
          <h3 className="text-[20px] font-bold mt-5 mb-2">Information You Provide</h3>
          <p>
            We may collect:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Name and contact information</strong>, including your name, email address and, if you choose to provide it, your phone number.</li>
            <li><strong>Account information</strong>, including information necessary to create and authenticate your account, and the display name you choose to show others when comparing results. If you add a profile photo, we store a small copy with your account and show it only to you. Continua uses passkeys, one-time email links, or one-time sign-in codes rather than passwords.</li>
            <li><strong>Assessment information</strong>, including the scores generated when you complete a Continua assessment, the version of the questionnaire used, and the date of the assessment. Continua stores the resulting scores, not your individual answers to the assessment questions.</li>
            <li><strong>Comparison invitations</strong>, including the email address of a person you invite to compare results, whether they accepted, and which result each person compared. A personal note you add to an invitation is included in the invitation email and is not stored by Continua.</li>
            <li><strong>Ratings by people who know you</strong>, if you use How Others See You: the email addresses of the people you invite, and, from each person who responds, their answers about you, the scores calculated from them, and whether they chose to be named or anonymous. If you rate someone else, we store your answers about them in the same way. You can also choose the pronoun used in questions about you.</li>
            <li><strong>Information previously entered about other people.</strong> Continua previously allowed users to enter another person’s name and, optionally, email address, and to associate assessments or groups with that person. That feature has been removed. Information entered by a user about another person was provided by that user and is not information provided, verified, or endorsed by the other person.</li>
            <li><strong>Chapter and content requests</strong>, including requests to receive book chapters or other Continua materials, the email address or phone number used for delivery, delivery status, and related error information.</li>
            <li><strong>Communications</strong>, including information you provide when you contact us with a question, comment, or request.</li>
          </ul>
          <h3 className="text-[20px] font-bold mt-5 mb-2">Information Collected Automatically</h3>
          <p>
            When you use Continua, we may also collect or generate limited technical information necessary to operate and protect the service. This may include:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>A randomly generated browser identifier used to associate an assessment with a browser when a person takes an assessment without signing in. This identifier may be stored in a cookie that expires after one year and in local browser storage, which remains until it is cleared. If you later sign in, assessments taken in that browser are attached to your account so that you can see them on other devices.</li>
            <li>Session and authentication information necessary to keep users signed in and operate the service.</li>
            <li>Technical information that may be recorded by Continua or its hosting and infrastructure providers, such as IP address, browser or device information, requested pages, timestamps, and server or request logs. This information may be used for security, abuse prevention, troubleshooting, and operation of the service.</li>
            <li>When the contact form is used, a one-way hash derived from the sender’s IP address may be used to enforce rate limits and prevent abuse.</li>
            <li>When we send a book proposal to a publishing professional through a personal link, we record when that link is opened and the type of browser used.</li>
          </ul>
          <p className="mt-3">
            We do not use third-party advertising pixels or behavioral advertising trackers.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">2. How We Use Information</h2>
          <p>
            We use information collected through Continua to:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Provide and operate the Continua website and assessment service.</li>
            <li>Create and manage user accounts.</li>
            <li>Authenticate users and maintain account security.</li>
            <li>Calculate, save, retrieve, and display assessment results, including displaying your own result alongside historical figures when you use the Compare page. Your result on that page is shown only to you.</li>
            <li>Send comparison invitations you request, and show a comparison to the people who agreed to take part in it.</li>
            <li>Deliver book chapters or other materials requested by users.</li>
            <li>Send service-related communications.</li>
            <li>Respond to questions, comments, privacy requests, and support requests.</li>
            <li>Maintain the security and integrity of the service and prevent abuse.</li>
            <li>Diagnose technical problems and improve the reliability and functionality of Continua.</li>
            <li>Develop, evaluate, and improve the Continua assessment and service, including through analysis of aggregated or de-identified information where appropriate.</li>
            <li>Comply with applicable law and protect our legal rights.</li>
          </ul>
          <p className="mt-3">
            We do not sell or rent personal information. We do not use personal information for third-party behavioral advertising. We do not use Continua assessment information to make decisions that produce legal or similarly significant effects concerning a user.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">3. Assessment Information</h2>
          <p>
            Continua assessments are designed for self-reflection and educational purposes. Assessment results may describe aspects of personality, behavior, tendencies, or interpersonal style within the Continua framework. These results are not medical records, psychological diagnoses, or clinical assessments, and Continua should not be used as a substitute for professional medical, psychological, therapeutic, legal, or other professional advice.
          </p>
          <p className="mt-3">
            Because assessment information can be personal, we treat it as private information and use it only for purposes connected with providing, maintaining, securing, developing, evaluating, and improving the Continua service, as described in this Policy.
          </p>
          <p className="mt-3">
            You can delete an individual result at any time from the results page or your account page.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">4. Sharing Assessment Results</h2>
          <p>
            Continua lets you create a link to share one of your own assessment results. Anyone who has the link can view that result while the link is active. The link itself does not contain your scores; the result is looked up each time the link is opened.
          </p>
          <p className="mt-3">
            You can turn sharing off at any time from the results page. A shared link also stops working if you delete the result or your account. Turning off a link cannot recall copies that a recipient has already saved, captured, or forwarded.
          </p>
          <p className="mt-3">
            Share a link only with people you intend to see your result, and do not post a link publicly unless you intend the result to be publicly accessible.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">5. Comparing Results and Information About Other People</h2>
          <p>
            Continua may allow a signed-in user to invite another person, by email address, to compare assessment results. To send the invitation, we use the email address the user provides and include the inviting user’s chosen display name and any short personal note they add. We do not keep a separate copy of the note, though like other emails, the invitation may be retained by our email delivery provider.
          </p>
          <p className="mt-3">
            Nothing is compared or shown to either person unless the invited person signs in, takes the assessment, and accepts. A comparison always shows each participant’s most recent assessment result, including results taken after they joined; if a participant deletes a result, their next most recent one is shown. Once both have joined, each participant can see the other’s result within the comparison. Either participant can end a comparison at any time, which deletes it for both. If the invited person declines, or does not respond within 30 days, the invitation is deleted. Users should invite only people they know and should respect their decision whether to take part.
          </p>
          <p className="mt-3">
            Continua may also allow a signed-in user to invite people who know them to answer assessment questions about them. The invited person signs in with the invited email address, answers from their own experience, and may answer “Can’t tell” to any question. Before submitting, they choose whether the person they rated sees their scores under their name or only as part of an anonymous average. Anonymous answers are shown only as an average, and only once at least two anonymous answers exist; in a small group, the person rated may still be able to guess who answered. A person who gave a rating can withdraw it at any time, and the person rated can remove a named rating; either deletes it. Unanswered invitations are deleted after 30 days. These ratings describe how one person experiences another and are not a diagnosis or an evaluation of anyone’s character.
          </p>
          <p className="mt-3">
            Continua previously allowed users to record another person’s name and limited related information. That feature has been removed, and those records are no longer shown on the site. Such a record does not mean the other person took a Continua assessment, consented to it, or verified its accuracy. Either the user who created a record or the person named may ask us to delete it by contacting <a href="mailto:privacy@continua.info" className="underline hover:text-accent transition-colors">privacy@continua.info</a>.
          </p>
          <p className="mt-3">
            Users should respect the privacy of other people and should not use Continua to record sensitive, confidential, defamatory, harassing, or unlawful information about another person.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">6. How We Disclose Information</h2>
          <p>
            We do not sell, rent, or trade personal information. We may disclose information to service providers that process information on our behalf to operate Continua (see Section 7). We may also disclose information:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>At your direction, including when you create or share an assessment-results link or take part in a comparison with another person;</li>
            <li>When required by applicable law, regulation, subpoena, court order, or other valid legal process;</li>
            <li>When reasonably necessary to protect the security, rights, property, or safety of Continua, our users, or others; or</li>
            <li>In connection with a merger, acquisition, financing, reorganization, sale of assets, or similar business transaction, subject to applicable law.</li>
          </ul>
          <p className="mt-3">
            We do not permit third parties to use Continua assessment information for their own advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">7. Service Providers</h2>
          <p>
            Continua currently uses the following service providers: Supabase for database, authentication, and storage; Vercel for website hosting; Resend for email delivery; and Twilio for text-message delivery. These providers may process personal information as necessary to provide their services to Continua, subject to their own privacy, security, and legal obligations and the terms governing Continua’s use of their services.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">8. Administrator Access</h2>
          <p>
            Authorized Continua administrators may access contact information, account information, assessment information, and related records when reasonably necessary to operate, maintain, secure, troubleshoot, and support the service or respond to user requests. Administrative access is restricted to authorized individuals, each signing in with their own account.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">9. Cookies, Local Storage, and Tracking</h2>
          <p>
            Continua uses cookies and similar browser technologies necessary to provide and maintain the service, including authentication and session technologies necessary for account access, and the browser identifier described in Section 1.
          </p>
          <p className="mt-3">
            Continua does not use cookies or tracking technologies for third-party behavioral advertising and does not permit third parties to track users across unrelated websites for advertising through Continua. Because Continua does not engage in cross-site behavioral tracking, browser “Do Not Track” signals do not change how Continua operates.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">10. Email and Text Communications</h2>
          <p>
            We may send email messages necessary to provide services you request, authenticate your account, deliver requested content, send comparison invitations you request, respond to you, or provide important information about Continua.
          </p>
          <p className="mt-3">
            If you provide a phone number in order to receive a requested chapter or other content, Continua may send that content to you by text message. Standard message and data rates imposed by your mobile carrier may apply. You can reply STOP to any text message from Continua to stop receiving further texts at that number.
          </p>
          <p className="mt-3">
            We will obtain any additional consent required by applicable law before using email addresses or phone numbers for marketing or promotional communications.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">11. Data Retention</h2>
          <p>
            We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, including providing the service, maintaining security, resolving disputes, complying with legal obligations, and enforcing our agreements. Retention periods may differ depending on the type of information and how it is used.
          </p>
          <p className="mt-3">
            Account information and assessment results may be retained while an account remains active or until you delete them. Deleting your account deletes the assessment results linked to it. A comparison record, including the invited person’s email address, is deleted when either participant ends the comparison or the invited person declines, and an unanswered invitation is deleted after 30 days. Assessment information created without an account may remain associated with the browser identifier used to create it.
          </p>
          <p className="mt-3">
            When personal information is deleted, some information may remain temporarily in backups or security records until those systems are overwritten or the applicable retention period expires, unless earlier deletion is required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">12. Security</h2>
          <p>
            We use reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure. Information transmitted between your browser and Continua is protected using encrypted connections (HTTPS), and access to administrative functions is restricted. No Internet service or information-storage system can be guaranteed to be completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">13. Your Choices and Privacy Rights</h2>
          <p>
            Depending on where you live and applicable law, you may have rights concerning your personal information, which may include rights to request access, correction, or deletion; obtain certain information in a portable format; object to or restrict certain processing; withdraw consent where processing is based on consent; and appeal or complain to an appropriate privacy or data-protection authority where applicable.
          </p>
          <p className="mt-3">
            You can delete individual results, turn off shared links, and end comparisons yourself. To delete your account or make any other privacy request, contact <a href="mailto:privacy@continua.info" className="underline hover:text-accent transition-colors">privacy@continua.info</a>. We may need to verify your identity before completing certain requests. We will respond within the period required by applicable law. We will not discriminate against you for exercising privacy rights provided by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">14. Children’s Privacy</h2>
          <p>
            Continua is intended for adults age 18 and older. We ask individuals under 18 not to create an account, take a Continua assessment, or provide personal information through the service. Continua does not use age-verification technology.
          </p>
          <p className="mt-3">
            We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take reasonable steps to delete it. If you are a parent or guardian and believe that a child under 13 has provided personal information to Continua, please contact us at <a href="mailto:privacy@continua.info" className="underline hover:text-accent transition-colors">privacy@continua.info</a>.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">15. International Users</h2>
          <p>
            Continua is operated from the United States, and information may be stored and processed in the United States. If you access Continua from another country, your information may be transferred to a jurisdiction whose data-protection laws differ from those where you live. Where applicable law requires particular safeguards for international transfers of personal information, we will use appropriate mechanisms required by that law.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">16. California Privacy and Online Tracking Disclosure</h2>
          <p>
            California residents may have additional privacy rights under applicable California law. Continua does not sell personal information or share personal information with third parties for cross-context behavioral advertising, and does not allow third parties to collect personally identifiable information through Continua for the purpose of tracking users across unrelated websites or online services. As described above, Continua uses its own browser identifier, cookies, and local storage to operate the service.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">17. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy as Continua changes or as legal requirements change. When we make changes, we will revise the effective date at the top of this Policy. If changes materially affect how we collect, use, or disclose personal information, we will provide additional notice when required by applicable law. Where applicable law requires consent to a new use of information, we will obtain that consent rather than relying solely on continued use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-[24px] font-bold mb-3">18. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, our privacy practices, or a request concerning your personal information, contact: <a href="mailto:privacy@continua.info" className="underline hover:text-accent transition-colors">privacy@continua.info</a> · continua.info
          </p>
        </section>
      </div>
    </main>
  )
}
