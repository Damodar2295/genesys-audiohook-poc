# Local verification — 2026-09-29

Environment: macOS, Node v24.19.0, npm 11.17.0.

- `npm install`: completed; final dependencies exclude the deprecated upstream uuid package.
- `npm run build`: passed (strict TypeScript).
- `npm run typecheck`: passed.
- `npm test`: 3 tests passed, 0 failures. Covers official signed client streaming, open/close, heartbeat, zero-duration probe, invalid signing secret, PCMU stereo WAV, L16 mono values, malformed stereo-frame rejection, unaligned samples and active-session shutdown.
- `npm run dev` + `npm run test:local`: executed against port 3000 with temporary process-only random credentials. Received 10 packets; server stopped with SIGINT. No credentials were persisted.
- macOS `afinfo`: recognizes output as 2-channel 8000 Hz interleaved Int16 WAV, 2 seconds, 64000 audio bytes.
- `afplay -v 0`: muted playback succeeded (exit 0). Initial sandbox playback failed to access AudioQueue; retry with audio access succeeded.

Sample artifacts are in `recordings/`, filename beginning `59ac3bc1-aa3b-4957-af9b-f05479876d1f-1790690703026` (WAV and JSON).

Not tested: real Genesys Cloud tenant, ngrok/public WSS, tenant activation, actual call audio, transfers and privacy/hold behavior, full upstream conformance suite. No live Genesys connection is claimed. The development server was stopped after verification.


ParakeetAI Timeline Export
Exported: 28/09/2026, 20:08:56

[19:02] Callee
I'm thinking, maybe we can do this as part of our today's discussion. Itself. And so that everybody is all sort of on the common page, we all stand why we are doing what we are trying to do.

[19:02] Callee
Okay.

[19:02] Callee
Okay. Good. Yeah. Thank you. All right. So, uh, a bit of a background. I know, like most of the people that are on this call have had this background in the past, but like, just refresh it, right? So we, this is all about bringing our enterprise, uh, insurance back into our one force platform right now. Or now in that context, earlier, we used to have our batch jobs that were bringing, I think they were nine, five. Then we come into data sync, whatever it is, right? It was going on. And then even though we changed the tech stack, multiple times, like from Informatica to data sync, like to, uh, nifi to data sync, whatever, we still continue to have multiple challenges, right? Because of the, you know, uh, de-linking or, you know.

De-linking between the records or the IDs and whatnot. Right. So the linkage and stamping the right kind of information on the right kind of records have been challenge for us, right? Also data latency. Now in those contexts, we did all this analysis in 2024, 2025. And we brought in. Uh, late o'clock, one of the biggest selling point for our data cloud was, okay, we can connect this data cloud to our enterprise data warehouse through, of course, STL and TTP. And we can zero copy federate all the data into one force that is almost like near real time. And, uh, you know, and we, uh, don't.

Have to move the data physically from one platform to another platform. One, one one another, you know, pointer that I missed in our pod was though these batch jobs were running in one force, the targeted objects like accounts, assets, contacts, even leads, they were all getting, uh, row lock errors, right? The records were getting locked a lot. And there were tons and tons of errors that used to happen. Of course, we had retry jobs going on, but even then, quite a lot amount of data was getting lost because of that. Okay, so I'm just giving you a bit of a background, right? So because of all of this, we then leaned more on virtualizing the data. Uh, of this, uh, you know, the firmographic data, if I may say so, mostly firmographic and maybe some demographic information also into, uh, you know, from Lumi. So, uh, one flows through data cloud zero copy protection.

Now, when we did all those analysis in 2025. Only one scenario came up. That is the highest spending pan 15 stamping of highest spending Pan 15 on the account level. That required some level of automation. When these kind of insights change.
Beyond that, there weren't any other such scenarios wherein we required to run any automations or run any subsequent flows based on the firmographic information being changed or financial information being changed.
So we have, uh, similar thoughts here. Like, is that still the same case or did we understand something more? And did we learn something more? And do we know that there are more automations?

There are not more automations, but there are dependencies on reporting and analytics. Yeah. Um, yeah. And then there are few dependencies on, I guess. Um, validation rules.
Um, but that's about it. Maybe a handful of validation rules again on the account level, I mostly the analytics is also on the account and the asset level. Okay. Right. Awesome. Awesome. Right. So analytics. Uh, thank you Sushmita. So analytics again, like, uh, we want to use mostly our CRM analytics. There, which is capable of pulling data through zero copy filtration and doing all the slicing and dicing. We have tried that out during our POCs and also a couple of other implementations that have gone in recently. They are also using the same patterns, right? So that's fine. And I think maybe the validation rules is something that we can look into and see where we land. Now. Thank you. Now with that analysis, I'm assuming that the past analysis that we had done. Still holds strong for quite a good extent. Right now, considering all that we don't have to be replicating all this spend data or the accounting side data, right? Uh, financial information back from Lumi into one force. So then, uh, so I did get the confluence page that you are working on. Thanks for sharing that. Uh, so let me share my screen. Where.
Is this? So before we go there, right, uh, let's double click on the validation requirement. Validation rule requirement, because that seems to be interesting. Uh.
To has that been documented anywhere in any of the pages? Uh, I would think that yes, but which validations in particular? Those were more on the like as you picked up the feature, but the validation rules for identified. So one of the validation, which I can remember is the creation of opportunity. From account based on some 12 months, a charge volume. Okay. So that was only one of those validations that I remember. And there may not be on the asset level, I don't think that there are any validations as such implementation objects. They do carry over some of those entities from asset into that. But there is no validation necessarily, or I don't know that part of the application good enough. Okay. No worries. So and the reports that we have, um, so the, even though yes, in theory, CRM analytics would be great, but there are more than 40 plus reports, which actually spans across account and account spend. And a bunch of these as well. So I think even if it is span spans across multiple objects, uh, I think, uh, are recommendation is to go with CRM because CRM is actually providing a much better, better capabilities than the standard Salesforce reports and dashboard. Mhm. Um, yeah, I think that should be our future path. And if there is any, uh, if there are any requirements, which we identified, uh, which still require.
Such building the report using, you know, the standard reports and dashboards. We can take a look at it, but all the complex reporting, which includes, um, merging the CRM data with, uh, data, SEC data, I think that's what we can do in serum. Okay. That's fair.

I'm just taking down notes here. Key point. Right. So we need to understand it. Trying to do some validate the data, ensure the data is good or the linkages are good and all of that. Right. So that CRM dashboard will help us to build the dashboards, but just need to be sure like where we are addressing the data quality issues and maybe the linkage issues and all of that. And then how we are addressing them. Uh, so did you already have a plan on that or like, how are we addressing that? Or maybe we need to solution for that? The linkage issues. I think that is what the is the crux of our discussion today. So, um, what we have seen so far is like, say, account level spend and account asset level spend. Um, I think the primary key, the foreign key that was initially created was based on a combination of, CRM ID, and then feed and then CRM ID and cm 11, um, mostly.

Again, because we, we do have the spends at the CM 11 level. And then again, it comes to CM 50 level as well. So going, but we, we kind of went back and forth on what should be the primary key across the tables and whatever. So I think cm 11, CM 13 was something that was. We were trying to use it, but in, in one force, we don't have CRM 13 or CM CRM 11. For the asset level, we only have CM 15. And then account. They don't have any of those. CM. 11 stamped on it. So we kind of retorted back to using CRM ID, but that is where a lot of, uh, like conversations that might have happened in the past where CRM ID cannot be trusted. That is what at least I heard from Sheriff. If I'm butchering it, please correct me. So if you you're right. And I think this has been a learning from the past as well, right? Mhm. Um, that we, we can't be using Salesforce IDs as a foreign key for, you know, pulling in data from our enterprise platforms into one force. Yes. Because everybody on this team, on this call, like almost everybody, uh.

[19:11] Callee
Who have had experience with one force, have seen the issues that we have, we have encountered with using Salesforce ID. So having said that, we, uh, before I move on, the spend on the account level, thank God we have such measures will have more insights to share with us.

[19:11] Callee
So my question for you. Sorry, I'm just posting this. The spend that comes on the account level, is it an aggregation or a summation of all the spend that is happening at an asset level? Or is it the spend that is on the highest spending ability?

So are you asking the requirement?
No. What is it today?
So it's aggregation. It's a roll up.

Oh, sorry. Yeah. It's a rolled up spend. Is it. So rolled up spend. Meaning like, uh, spend across all the assets under that given, uh, account. And then you roll that up and you can use that, right?

I think accounting, decision. So foreign account. Yes. All the cards on.
It. Yeah. Right. So the account level. That's why I think we were using the CID there. And also we were using I don't know if you are using I maybe we can use because I click ID can have linkages to all the things. That's how the assets are linked to an account. And uh.
Then this is what I was being, uh, analyzing. If I want to bring in any financial information at an account level. I click ID is widely used across the organization. So we can rely on the click ID.

Have been shifting, stamping on that and the spend and all the financial information that we get that is at the level we can definitely use that. But with Pan 15, there is a encryption problem, right? And I think you and I spoke about that, meaning that a Pan 15 is always encrypted in the Lumi tables. Right? So if you want to use Pan 15 then we have two approaches here. One either we create a materialized table with decrypted pan. 15 and expose that into one force. Right. Using where formulas.
Or. Or wire functions or we create a hash function, right. Using the same keys. So in one force we create a hash function using the same shared key and then we also create a hash hash value of the pan 15 using the same shared key. And both of them can be, you know, used for a matching. And then table itself.

Does that make sense? Can I go back to the I click first because we just did. To two conversations. Right. So I click is that can we trust. I click to have consistency and every account that we have has. I click on it.

Can I click B then the the primary key. Between the transactions and the CRM data. Is that a consensus then? Because before we move on to the way of how we are doing the calculation.
All of the customer accounts are likely IDs. And yes, I click IDs are must have even for the. Creating the account hierarchies as well. Without that, we can't. Okay. And would I.

That is something that we can do. Between the transactions between the Lumi and like the. All the Lumi tables that we are going to create, including, let's say, risk profiles and whatnot. Then can we then assess like, yes, the click ID remains to be that one particular key. So think about the risk, the account for more graphics and the spend.
Yeah, I think I would want to hear from Mike as well. So I think um, this is something we explored in the.
The account under it mean five. Assets under it and a site under it.
But that's okay. Right. But they will have a different type.
When they are getting.When we are aggregating that based on the account type, either we can pick up or we can pick up assets. Yeah. So the goal is like a question is like this. Can we rely on the enterprise data of this? ID and the related accounts to do all this spend. Summarization aggregation.\
Wondering why is it that we want to use it just because it can be.
So I shall. You do this then, right? I understand so CM 11 has that encryption. Uh, complexity. Right.
Which definitely we can handle. That's not a challenge. Right. Like if CM 11 needs encryption, then maybe. As I said in the beginning, maybe we can use a common key that say, one for side and a common key. The same common key at the gloomy side to hash the CM level values and use those hashes for matching, because then hash value can be plaintext.

[19:21] Callee
Right? So that would still solve the problem for us. It's just that additional step will have to do. And we'll at one fourth side, we'll have to go back and update all the existing records with hashed value. That's an additional step. So that will have to, own up, which is okay, like, because, you know, this is the first time we are trying to do this integrations and we are trying to establish this patterns and whatnot. Let's start clean so we can either do that or we can use iCloud, right? Or any of the identifiers. Basically. So in that context, can I request, if you don't mind. Right. Maybe I'm coming this coming to this into a lot of blind spot here. Is there somewhere we can.

[19:21] Callee
Look for all these ID relationships.

[19:22] Callee
Back in the days in the marketing world, we used to have the same kind of complications. When it came to like, uh, campaign ID versus source code versus versus drone ID. Is that etcetera, etcetera. So we created this like a, you know, identifier relationship hierarchy, something like a diagram. I'm trying to find for find that I'll find that, I'll send that across to this team as an example. Maybe we create a.

[19:22] Callee
You know, at least a visual for that.

[19:22] Callee
So that we can understand which IDs are at what level and what is the aggregation that we need to do. Or maybe we already have. And I'm talking too much about it.

[19:22] Callee
In the enterprise level, right. So the one that like how I click the next to an account to a transaction and things like that, that like level of lineage information, I think so. And maybe we can, I can reach out to, Partha as well. So, uh, Partha from EPC, I think he was doing some kind of this, uh, association. I can reach out and get that information. And share that as well. So maybe then. Okay, so from an understanding alignment point of view, can I say this as a team, we are aligned not to use a CRM ID, but we want to use a alternative. Yeah. Right. I mean, yeah. Thank you. Now to do this alternate, like to use this alternative, we have few options at hand, which we need to explore. One is, the same level. Same level comes with its complexity, but we have greater confidence then, right? Because the rolling of the information, the association, etcetera, etcetera. Happens that consistently. So we have greater confidence, but it has its own complexity. Uh, encryption and.

[19:23] Callee
Encryption. Second is the I click ID. We can use, I click ID and even in Lumi, we can do this aggregation, but that requires greater amount of data churning at Lumi level, right? Meaning like when we get spend information from, uh, you know, uh, the space systems, we need to then link them with the given ID that we have based on the relationship with customer 360 and whatnot. And also we need to, uh, you know, aggregate that information at likely level. And also we need to take care of the supplemental hierarchy, use cases as well. Right? And then, uh, one given thing is we always get all the necessary spend and financial information at a Pan 15 or a CM 15 level consistently, right.

[19:24] Callee
And the CM 15 are already in one force at an asset, level.

[19:24] Callee
So is this a common understanding from a data gathering and point of view. Yes. We need to do a little bit more research on finding the identifiers which we can take away, right? Like each of these team members can take away, like even myself, my suspicion. Yeah. You guys can take away and they can again regroup and say, okay, this is our finding from each of these sites, right? Um, yeah. So, um, I'm sorry. Sorry, just one other thing, because we are on that same context. I am trying to remember in the marketing world, we had something similar where the last five of the card was actually exposed. And we also had CM 15, which was CM 15 or 13, which was used to link the profile of the card members. But it was all encrypted. So we didn't necessarily have the hashing, but it was one time encryption. So that encrypted value itself became the key. Can we like if if there is a need where we might have to go back to having CM 13, CM 15 as the key. Then can we have that? Like, let's not decrypt the value on the CRM platform. Let's have the encrypted plain text. Sync into CRM as is and use that as a key.

[19:25] Callee
And I think that was the one of the recommendation. Uh, Sushmita. In the beginning as well. I think when we talked about the data masking. Uh, there's.

[19:25] Callee
And I had a similar ask as well. Can we use the same, encryption mechanism in both, uh, both. Yeah. Yeah. In the CRM world. That way we can match using the encrypted value. Correct. And we don't have to decrypt it ever again in CRM. We don't have to do that. So the data is also protected. And the we can only show the last five digits to the users. And there are few integrations here and there. But those integrations, again, kind of, you know, uses, um, I think, uh, what is the latest encryption that the company is using hybrid maybe I think they're talking two different things, right. And, and masking, what we did is masking. Yeah, not my, my point was just encrypted values being used as a key. And yeah, yeah. If you use encrypted key, you don't have to worry about masking those fields. That's what the point is. Okay, so sorry to interrupt here. So then there are two. Sorry, sorry. Just, uh, to just one point that I.

[19:26] Callee
Yeah, yeah, we can take up encryption separately, right? We have lot of validation rules and other things. I want to make sure we don't mix two topics right now. Sure. That's what I'm trying to step in here. And just saying this. Maybe we do both.

[19:27] Callee
We already get the Pan 15 today in the plain text. And we store that in one place. And we are using some of those things for, uh, you know, some validations or some to that only the Pan 15, not the financial information associated with the Pan. Yeah. Just the Pan. 15. Yeah. And we can do both. Yeah. Right. So in that sense, the existing validations and existing things would still run. And because the end users also need to look at that bank. 15. So maybe there is a different way of doing that. Uh, you know, looking at that, we can do an API call or whatever to the, uh, you know, to a middleware server that can be, the thing that we want to, I think step by step, like what we want to do here. I mean, how do you want to transfer the data from Lumi to data cloud to, uh, one force, right? I think we need to understand the, uh.

[19:28] Callee
Comment because the way it is stored and the CM or 15 in Lumi, it's like we're safe encrypted, right? Or is it not encrypted? It's encrypted. Quite safe. Encrypted or hyper encrypted.

[19:28] Callee
Encrypted. So.

[19:28] Callee
I mean, earlier we our understanding is like in data cloud, we cannot decrypt using safe. Right. We didn't have that capability there. And I don't know about like in one force, whether we can do it or not do it. Anybody knows about it. Like we can do it in one force. But the point is we don't have to. That's the thing. We don't need to decrypt it on CRM. We will just use encrypted plain text as is. Use that for the encrypted plain text. When you say that, that's a bit bit confusing for me, encrypted means you cannot read account number, I think.

[19:28] Callee
Well, well, again, I'm not going to the phone number though. Let's just stick to the friend thing. We are not this. This is not a one solution that fits all the problem because two Sushma's point. There are. There might be few validations that needs a different level for. Like the hashing or the work that she has done. And also, uh, when we look at that. Encrypted encrypted text like that, it generates either scrambled text, the text length is quite, varying. It's not 255 characters only or like it becomes bit tricky. Maybe we can look into that, right? Uh.

[19:29] Callee
I had another suggestion. There is can we do, uh, if we hash the value and Sri and the Ramayana.

[19:29] Callee
Need to educate us here. Let's say we hash the value. We take span 15 and we have a, you know, certificate or a key in hostile, gloomy, dedicated for our layer. And we use that key to hash the pan 15 value pan 15 or cm 11 pan 11 value. Okay. And that has value is obviously scrambled. And we can do the same. We can use the same algorithm, crypto algorithm, and we can use the same key in one force as well, because hashing is possible in one force, one way.

[19:30] Callee
Hash values right. That you can do.

[19:30] Callee
It in data cloud or maybe confluence. Right. One force will do it in one force, right. Or we can do it in data also. But at least will do to begin with, let's consider one force, right? Maybe we can then optimize that and make it more efficient to do it in data cloud later on. But to begin with, in one person. So there are two things here. Yeah. For two, if you are going with that option. Right. There are two things we need to consider. One, like how we store in, uh, Lumi. I mean, we, it has to be corrected in Lumi. Second on the fly. When the it is queried or maybe we are querying it or something like that, that query execution happens on Lumi. At that time. You want to hash it, decrypt it, and then hash it in the your own algorithm that can be decrypted in one force on the phone can be done. Anything is now in transit. You are using a custom hashing mechanism, which I think we should be ensured that the enterprise like Lumi, they are okay with that or something like that. What you might be saying is sorry, what what the issue might be saying is, is hash it while it is in Lumi and not UN hash it. We don't need a need to un hash the record later on. Right. Because and hashing that's fine. But you don't need to hash it in data. But it is not.

[19:31] Callee
Going to you. Yeah, yeah. But it is not being hashed in the transit. So if you go and query the GCP. Table, you will see the hashed value in the column over there. And that would also appear in the data views as well. And there is no UN hashing happening in the connector. Yes. Right. So thank you. Yeah, exactly. Thank you Sushmita. So that's what I'm trying to evaluate here. Let's say we hash the values and with the key, right stored in Lumi and we store that hash value. Lumi. And we store the hashed value in one processor. And of course we'll have the plain text. Uh, existing fields. And we are not going to touch that because we need that for other processes. We need that for the UI and users, but we use this hash key for creating the linkages at same level. And Cs50. Okay. But the requirement there would be the hash value in Lumi shouldn't be again. Encrypted first. Yeah. If you come as that way to check on the data governance policies within. Okay. Right, right. So that's what I. Yeah. Can you, can you, uh, summarize like maybe give like, what will be that hashing algorithm, like, you know, are you using your key based algorithm or is there anything else that is done? I mean, that that can be, uh, you know, Sushmita is saying you never need to decrypt it. That's why I'm not able to understand, trying to understand if you so in one course, we'll use the. A ES2 hundred 56 hashing algorithm. And with the Amex Ka certified key. Okay, okay. And same key certified key we can host.

[19:34] Callee
As my aunt said, a lot of the systems within. Amex also are not using eclipse, but they are using CM levels in cm. 50. Okay. And then one last question then. So when we are inserting effects, that's the first time when an asset gets inserted that asset record is supposed to have the same hashed value saved somewhere on it. Yeah. Okay. So we can put that in the trigger itself, right. Like got it. And then.

[19:34] Callee
One thing that for account level, for account, we, we have never historically stored cm. 11 at all. So we are we will have to also create a field at an account level to do that, because account doesn't have a dedicated account level number. We we have the highest pile. 15 the highest pending asset of the account. 15 of the. That asset becomes the no. But that is. So when we do the account level spending, it's the aggregate of all the CM 15, not just the highest spending Pan. 15 right. So that means account will need a hashed dedicated value to link accounts. Spend and then account level asset would need a dedicated hashed value to identify the asset level spend. So there would be two different discrete. Yeah. Okay. But then my Pooja do you guys see that we can bring in the same level at account? Uh, level?

[19:35] Callee
Uh, I think I was like my already shared a couple of conference pages in that chat. Uh, team chat, can you please bring it up? Because that has certain information with respect to the volumes and also, uh, certain, uh, examples that mine captured. So that that is a good reference point. So my, that. Yeah, yeah. So, so there are two pages. So one is talking about the zero copy versus, uh, activation or ingestion. The other one is talking about what we are discussing here, right? The options that we have for pulling the, for pulling the data, right? The secure internal ID. So here we have the options. And one of the option here is Fisher. What you are mentioning just with the add on that.

[19:36] Callee
Uh. If we need to encrypt, uh, the values on both sides. Is it okay to have the key at the sales level? Also, or should we pull in the tokenized value through an API? Is is.

[19:36] Callee
From security standpoint, is it okay?

[19:36] Callee
Say that again, please.

[19:36] Callee
So so what we have is suggesting was that we encrypt the value the CM 11 on both sides. Using the same key right.

[19:37] Callee
Not a problem. Hashing.

[19:37] Callee
Hashing. Okay. Yes. Now if you're using the same key.

[19:37] Callee
Right.

[19:37] Callee
The same case is available to Salesforce. Also. Is that okay? So.

[19:37] Caller 1
La

[19:37] AI
**SIGNAL:** `RISK`

**SAY:** Sharing an encryption or hashing key across both Salesforce and Lumi introduces blast radius concerns if Salesforce is ever compromised. We should check if we can rely on a tokenized value from an API or enterprise KMS rather than duplicating the raw key in Salesforce.

**WHY:** Storing symmetric keys across multiple platform boundaries violates least-privilege key management principles.

[19:37] Callee
Security standpoint. Okay. Because um.

[19:37] Callee
Here. What if you look at the third option, the Mac token, the I think what you are suggesting is the fourth one essentially similar to the fourth one, right? Where we are encrypting the value on both sides. Here only with the third option, we are tokenizing based on the API, where we give a cm 11 to an Amex service. It returns the encrypted value to us. The key never sits with Salesforce.

[19:37] Callee
So is that in a bulk? Doing that in a bulk becomes a very, uh, tedious path. Then.

[19:38] Callee
Right now, that's the other question. Are here. We are specifically looking at zero copy. Right, which will be a 1 to 1. Wait wait wait wait wait. But but wait wait wait. Bulk. We don't need zero copy. So so from going forward. Well, anyways, the asset data and the account information is coming back from Lumi into one force for the first time. Right? You have to create the accounts. We have to create the, uh, shell asset records. And we have to stamp these IDs anyways, it is going to come from Lumi into workforce. It the encrypted value, right? So while then when we are creating this, uh, when we are stamping, let's say I click IDs and whatever onto the account level, which we have to do, right? And we are creating this shell assets and we have to stamp the bank of teams. Can we then also stamp the Mac encrypted token in parallel? Because see ultimately, once this requirement is once these records are created in one force, then we don't want to keep on bringing in the spend information and stamping the. All the rest of the fields, the rest of the data points. Besides the IDs, the only what the IDs and the tokens in one force. Rest all the data we want to virtualize, right.

[19:39] Callee
Yeah. So that's a different conversation, right? Just one question though. These tokens should not be changing. Every time I go and call the service. That's the other thing. So at the time when asset gets created.

[19:39] AI
💬 **Question**: Ensuring tokens or encrypted values remain deterministic and do not change on every API call during record creation and zero-copy virtualization

---

⭐️ **Answer**: The requirement for deterministic tokens is standard for maintaining referential integrity across systems like Salesforce and Lumi. We should ensure the tokenization service is deterministic—meaning the same input value always maps to the same token using a fixed salt or deterministic encryption—so we don't break downstream joins or re-encryption lookups during batch provisioning.

[19:39] Callee
The token had one, two, three in it. Then at the time of lookup. I should still be able to have the same token value. So it has to be very deterministic. Okay. Yeah. It has to be deterministic. It has to be one way. Yeah. That will be taken care of. Okay. So right. So the other option is which where we while ingesting the assets into Salesforce or creating the account into Salesforce, we also bring in the hashed value or the encrypted value. Yes. Right. And we use that for lookup. Yeah. That is only when we are able to bring in that value it in Salesforce through an ingestion to ingestion. Yeah. Correct. So the first that is fine. Yeah. That's fine. So we just need to create a new field.

[19:40] Callee
Go on, go on. Finish your thoughts. No, no that's correct. So we just have to create one more field on every.

[19:40] Callee
Object that needs to be looked up. Having this. Yeah. For which. Right. So yeah, that's another option. Correct. So so I mean that still means that the asset ETL that we have today will all be updated with this new feed, this new feed. Yeah, yeah. So okay, so, so the whole point is the asset, see, we still have to create that account record. We still have to create that asset record. Okay. But these, these will be like shell records. Right? Today on account an asset. Let's say I'll go here onto this, uh, this header. But see, this is our asset object, right on this asset object. We have all these fields. I don't know if you guys can see my screen, right. Yeah, we can. We don't have to bring all these fields. We don't want to bring all these fields and keep on updating them at the account level. All we want to do, all we want to do is bring in that, uh, pan. 11. Yeah. Right. Uh, Pan 11 and pan. 15. Uh, Pan 11 and pan 15. And maybe one more field. The encrypted value encrypted key or whatever it is that is it. The rest of the fields. We just want to zero copy federated, correct? Yep. Absolutely. Understood. All right. So now this is a larger change. The, uh, and the reason why I'm saying this because this year those dependent components in CRM has a huge bandwidth. Like it's a whole spectrum of changes that needs to kind of cascade into.

[19:40] AI
**SIGNAL:** `SUGGESTION`

**SAY:** Just to confirm on the data model side, we should make sure that new field is indexed as an external ID or unique constraint in Salesforce to support fast lookups during zero-copy virtualization.

**WHY:** Ensures O(1) or index-backed lookups for virtualized joins without performance degradation at scale.

[19:41] Callee
Do you sorry to ask this. I know I'm asking a very blunt and stupid question. Sorry to ask this, but.

[19:41] Callee
Any chance. Anybody has a summary list of what those changes would be? I can share yes, I can share a markdown file which has the asset level and again, for a certain account which has the, you know, where what's the dependency in the repository. I can share that. Okay. Yeah. Thank you, thank you. Okay. Maybe maybe then what we can do. Sushmita, the reason I'm asking this is one.

[19:42] Callee
We can take is slicing that even that problem as well, right? Maybe we start with only a level. So zero copy federating that and then we. Uh, rewire all the assets. Then we start working on the asset level. Then we rewire the level, we we ditch all the asset jobs as well. Yeah, yeah.

[19:42] Callee
Okay. And then what is your reporting?

[19:42] Callee
And whatnot, whatever that comes into CRM, if move it from CRM to CRM analytics. Yes, yes. So somebody is trying to say something. Yeah, it was me. So the one thing that I want us to validate before we kind of explore this further, uh, there are cases where, uh, band 15 is used, uh, in the rest API call as a unique identifier. For example, we.

[19:43] Callee
Financial API with the encrypted band. 15. Uh, in that case, you would need an actual, uh, band. 15 number, which needs to be encrypted. Uh, in the financial API.

[19:43] Callee
Yeah. And then API call needs to be made. So it is not preserve that. No, no, band 15 will still be preserved as is because of those API integrations. Exactly. The interest set, just as it will have.

[19:43] AI
**SIGNAL:** `RISK`

**SAY:** Since pan 15 is still needed for active financial API integrations, we should make sure that zero-copy virtualization doesn't introduce latency spikes or rate-limit issues for synchronous outbound calls.

**WHY:** Prevents production latency degradation or timeouts in external financial API calls relying on real-time data lookup.

[19:43] Callee
This new field and that about it. And maybe the product on it. So one question I had. Right. Uh, just on that point, right. Yeah. So let me, let me just, uh, complete the statement. So, uh, the pan. 15. Uh, the plain text pan 15 field should not be exposed to the user. It will only be used as a back end identifier. And for any API calls, which needs to be made of the Pan 15 encrypted value, that's continue to happen. And then for all other matching, we will use the hashing mechanism. So the one thing that I would, uh, probably suggest is to validate, uh, the strength of the hashing from enterprise data security point of view to make sure that we are comfortable with it, because we are talking about Pan 15. So hashing is good, but it is not, uh, much secured. Yeah. So you are suggesting mine was suggesting the Mac token, right? I mean, that's what we aligned lately, right? That's correct. That's correct. Right.

[19:44] Callee
Okay. Yeah. No, but but guys, this is what I.

[19:44] Callee
Yeah. So even just quick addition, if we encrypt it on both sides, right, then we are we know that we are limiting it. The lookups to the own to objects that carry encrypted value. Correct. Right. If, for example, we need to look it up, look up a cm 11 detail from through a lead object or some other object which not carrying that cm 15, since it's a newly formed cm 15, we will not be able to do that.

[19:45] Callee
100% we know that limitation, right? So okay. Because if you have a tokenization service for like Mac, then it covers all of the scenarios. So one thing I just want to understand, uh, one, one solution. Let's think about this one, I don't know, see, the Mac token is one thing. Then hyper encrypted token is another thing, right? So what I have seen in systems, right, because this is earlier, it was like voltage encryption. People used to have voltage encryption. So what I have seen is like in all the.

[19:45] AI
**SIGNAL:** `SUGGESTION`

**SAY:** If we use format-preserving tokenization like Voltage instead of standard hashing, we avoid breaking cross-object joins while keeping the primary identifier encrypted everywhere.

**WHY:** Solves the lookup limitation across unencrypted objects without exposing plain text PAN 15.

[19:45] Callee
Tables and all the data where we store everything is encrypted in like one token so that you can always, you can use that as an, a key to identify any account. Okay. Like CM account or something like that. So the point. Yeah, deterministic. Right. So the point here is you decrypt it only when it is needed. For example, you want to display it on the screen or wherever. Like, you know, you want to show it to the, uh, you know, the account manager or somebody, whoever it is, right? Whenever the user want to see it, only then it will be decrypted. Is it not something approach can be followed. I know there are like existing data where we need a decrypted value, but can we consistently have one encrypted token which can be used as the ID for that particular CM level? Or like cm 15. So yeah, I'll answer that question. Um, let me first split this into two parts of this discussion. One, first of all, we are trying, we are trending to.

[19:46] Callee
Using the same level or CM 15 to be used as an encrypted value, as a lookup between both. Yes. Lumi. Uh, through zero copy Federation. Okay. Now how do we handle this encryption? Where do we store is the question to that? I think Sushmita and I, we made that suggestion that.

[19:46] Callee
Anyways, first time when we are updating the account, customer account records and first time when we are creating the asset values, when we are pushing the data into one force, right, we have to create account. We have to create asset records, shell asset records, right? At that.

[19:47] Callee
Point. In addition to adding the, uh, stamping the same level CM 15 as the plain text that we do today, we'll also stamp the encrypted value as well on.

[19:47] Callee
The account level, CM level at the account level, encrypted. Uh, CM 15 and CM 11. At an asset level, encrypted.

[19:47] Callee
Okay. Rest of the financial and rest of the, uh, you know, uh, you know, information.

[19:47] AI
**SIGNAL:** `SUGGESTION`

**SAY:** Stamping both plain text and encrypted IDs during initial ingestion gives us lookup performance on zero-copy federation without exposing raw identifiers. We just need to ensure our key management handles rotation for those encrypted fields cleanly.

**WHY:** Validates the dual-stamping ingestion proposal while flagging key lifecycle management as the primary architectural consideration.

[19:47] Callee
Uh, rest of the fields will not stack. They will be zero copy federated. We will be using this encrypted. Uh, value that is stored in one force to do a lookup back into Lumi. Like same, you know, same values, string match. And we'll get the necessary information. Zero copy protected back into one for.

[19:47] Callee
Okay. Second point in this context, Sushmita brought up, like this so many automations in on account level and asset level. And she has an analysis. She has a markdown file. What we going to do here is we are going to look at that, uh, that markdown file, all the automations. We are going to split that problem as well. First, we will target the account level because it's easier and we'll try to rewire all those automations to use the zero copy federated values instead of the values in the, uh, you know, stored.

[19:48] Callee
In the one force. Next stage, we'll start, uh, you know, tackling the asset level automations. Okay. Now coming to, uh, this is what the plan is. Okay. Now coming to your question, can we also, and the same level 15 that we are storing in one first today, plain text. Can we also keep that as an encrypted one or tokenized one? And can we use the RM token tokenization service to make a call at real time and showcase the value. Only when it is needed? Only when it is needed?

[19:48] You
SAY: Sharing an encryption or hashing key across both Salesforce and Lumi introduces blast radius concerns if Salesforce is ever compromised. We should check if we can rely on a tokenized value from an API or enterprise KMS rather than duplicating the raw key in Salesforce.  WHY: Storing symmetric keys across multiple platform boundaries violates least-privilege key management principles.

[19:48] AI
**SIGNAL:** `RISK`

**SAY:** Sharing an encryption or hashing key across both Salesforce and Lumi introduces blast radius concerns if Salesforce is ever compromised. We should check if we can rely on a tokenized value from an API or enterprise KMS rather than duplicating the raw key in Salesforce.

**WHY:** Storing symmetric keys across multiple platform boundaries violates least-privilege key management principles.

[19:48] Callee
We can. And we can have like a button situation where like, you know, we just show the token values and ask people to click on this button to get.

[19:49] You
can assymetric encryption used here?

[19:49] AI
💬 **Question**: Can asymmetric encryption be used for storing or tokenizing identifiers like CM 15 between Salesforce and Lumi?

---

⭐️ **Answer**: Yes, asymmetric encryption can be used here by leveraging a public/private key pair where Salesforce holds only the public key to encrypt or tokenize identifiers for ingestion, while Lumi (or an enterprise KMS service) holds the private key to decrypt them on-demand when a user clicks the button. 

- **Security Isolation**: Salesforce never has access to the private key, preventing a blast radius issue if Salesforce is ever compromised.
- **On-Demand Decryption**: The "button" UI interaction can trigger a secure, back-end API call to the system holding the private key to fetch the plain-text value dynamically only when authorized.
- **Performance Trade-off**: Asymmetric encryption has a higher computational overhead than symmetric encryption, but since it is only used for occasional on-demand lookups or button clicks rather than bulk data paths, the latency impact is minimal.

[19:49] Callee
A show the actual numbers. We definitely have to look into all the other integrations that we have. Like, for example, the, uh.

[19:49] Callee
The spend limit integration that we have, right where we are using the span 15 as a key to get the necessary information back from the spend API or the CAS API. Right? So in that situation, we'll have to create some kind of a like either we convert those integrations. Also as a zero copy federated integrations rather than real time, or we'll have to look into how do we refactor these integrations. Maybe we take that as a third stage, right? So that we completely move away from storing plain text into plain text values, into one force. And we, uh, you know, tackle the, uh, we use the tokenization service there. But that we can tackle the third stage.

[19:49] Callee
Right? Because all the time you'll be the PC is compliant also with that. Yeah.

[19:50] Callee
PC days is compliant. You don't want to store anything like plain text. Hundred percent, 100%. Like it will be best to be aligned with that. Yeah, totally agree. And I'm seeing my stats here. There is a blast radius thing going on is asymmetric encryption. Uh, the mother of the care to share some insights there, please? My point is to share, I think hashing is not a.

[19:50] Callee
Efficient method when it comes to protecting the PII data, because the data is also getting transferred over the network. Um, you know, before it makes to data cloud and also CRM as well. So conceptually, I agree with the proposal, but I think we should explore the asymmetric encryption and see if that can be a solution. You know, before we go, the hashing. Hashing. Yeah. Will help you to validate whether the value is modified or not. But I don't think it is a secure way of, you know, protecting the data itself. Actually, if we can. Sorry, if we can, um, if we can leverage with asymmetric encryption plus, uh, private key pair, uh, like where Salesforce can hold the public key, but we can have a private key that, uh, yeah. And that's exactly what I'm also talking about.

[19:51] Callee
Uh, so basically one side would have the private key, uh, the other side would have the public key. So that way, even if the key is compromised, the data will still be protected. So just to just for the clarity, it is still going to be always deterministic, right?

[19:51] Callee
So what do we mean by deterministic? Can you expand on that. You'll be able to link it.

[19:51] You
what is assymetic encryption?

[19:51] AI
💬 **Question**: What is asymmetric encryption?

---

⭐️ **Answer**: Asymmetric encryption—also known as public-key cryptography—is a cryptographic system that uses a matched pair of keys: a **public key** to encrypt data and a **private key** to decrypt it.

- **Key Separation**: The public key can be safely shared and distributed widely (e.g., stored in Salesforce to encrypt identifiers or tokens), while the private key is kept strictly confidential and secure in a backend service or KMS (e.g., used by Lumi to decrypt data on-demand).
- **Blast Radius Mitigation**: Even if the environment holding the public key (like Salesforce) is compromised, an attacker cannot decrypt historical or incoming data because the private key never resides there.
- **Deterministic Property**: Depending on the algorithm (like RSA-OAEP with fixed padding or specific deterministic configurations), asymmetric encryption can be made deterministic, allowing systems to look up or join encrypted records across databases without exposing plain-text values.

[19:51] Callee
To any other. Yeah. I need to be able to link. So every time my out if my input is same my output needs to be same. Yeah. So that is where if encryption like there is already an asymmetric deterministic encryption protocol as well. But we have to stick to that. It cannot have different outcomes every time. Yeah, yeah. That should be the case.

[19:52] Callee
No, no encryption won't produce it. Shouldn't outcome hashing will produce a different outcome. No it it's the other way around though. That's what that is. Why I guess we were moving with hashing first, because hashing is always predictable.

[19:52] Callee
Sorry to interrupt. There. Salesforce can handle both encryption as asymmetric encryption and hashing as well. If you guys need it. But we can. What I suggest is.

[19:52] Callee
Let's start with this, right? Like, uh, see, we don't even need that. Like we are talking about the third stage at this moment, first stage, getting the encrypted value itself from Lumi back into one force.

[19:52] Callee
Yeah. I think what I want is that, that, that first stage, what do we use? Do we use a symmetric encryption or do we use hashing. That's because hashing is definitely is not as secure as encryption is. And with the quantum techniques not approved that now with the quantum techniques, it is. Yeah. Sorry, sorry. But Sushmita the wires.

[19:53] AI
**SIGNAL:** `SUGGESTION`

**SAY:** "To make sure we can do lookups in Salesforce while keeping data secure in transit, standard encryption with deterministic padding like RSA-OAEP gives us both predictability and confidentiality without relying on raw hashing."

**WHY:** Reconciles the debate between deterministic lookup requirements and security, steering the team away from insecure hashing for sensitive PII.

[19:53] Callee
Encrypted text like the text is anyways present in only it is. But it's also valuable size isn't it? It's like the size is a problem, isn't it? So we would want something of a fixed encrypted like virus. It was definitely the easiest choice because it's encrypted. All I need to do is ingest it as is no transformation needed. So if we are doing the as encryption right of the Pan 11 and Pan. 15 in Lumi itself.

[19:53] Callee
Right. And then we are pushing that value back into one force. So it would still work for us.

[19:53] Callee
Right. Yes. But I'm just wondering if is it not counterintuitive that you are sending the encrypted value along with the decrypted value and storing it in Salesforce and.

[19:54] Callee
Will not send any.

[19:54] Callee
We, we, we are we are going to move away from, as I said, like the moving away from the plain text.

[19:59] Callee
Good question. Why? I think that's what that's what the suggestion suggests. Solution says that you have to start with encryption in CRM. That's what she is saying. No, no, start with me. Lumi. Encryption? Yeah. What she is saying we have two ways, right. And that is where the execution becomes critical. First is to ingest the data. First in CRM, a set record has to be there and account record has to be there before you even look up the financials for it. So that's level one, where she has been suggesting already ingest the tokenized or the encrypted or whatever that secret key is, ingest it during the time of rapid creation. And then when you are looking up for bringing further zero copy data, use that as the key. That's as simple as that. There is no API services that Salesforce need to trigger to do anything beyond that, because so what you are suggesting is you will always maintain a, you know, relation of that encrypted token to the plain text value.

[20:01] Callee
Also stored ahead. The encrypted value. Then we do not even have to make that call as well. Correct. So we need to align on one common encrypted encryption mechanism here so that we don't have to decrypt multiple times and do it in different mechanisms. Just every service needs their own. But I think Micah fence and everybody is using the have is.

[20:01] Callee
So that's where if we have a hybrid version encrypted key across Lumi and Salesforce, that's like the suite everywhere is a is a enterprise wide, even servicing. Everybody is using hyper encryption for account number. When they switch from voltage, I mean, that's what I was asking to my ankles. Like, is hyper is something we can do in Lumi also so that we can across the board, right? One force and Lumi everywhere. We will use only. Hyperten Crypted account number. That would be ideal solution.

[20:02] Callee
Right.

[20:02] Callee
So that everybody. I'll put. I'll put that in a conference so that everybody can appoint. Update. I'll put that as stage wise. Right. Stage one, stage two. Stage three. What are we going to do?

[20:02] Callee
My request is go ahead. Take a look at that. Update that comment on that. Make sure that we are all aligned on that. Right. Second, the hybrid encryption or we use the AOS encryption or asymmetric encryption, which what to do? The mother and my aunt. Can I request you guys to take that away and figure out which one is the best approach there?

[20:02] Callee
Sure. Right. Yeah. We will take it back. Yeah. Right. Okay. Third. Third thing. Sushmita, based on this discussion. Maybe as part of your bill, if you and your team do a quick POC, maybe just use some string value, right? Like obfuscated value in Lumi and see if this mechanism would work. Yeah. And, uh. Lastly, share that MD file. Maybe Sushma myself use. Sushmita. We can take away to see how we can slice and dice that one. So your hand is up. Yeah. So, so.

[20:03] Callee
What I want once again. Sri. Uh, sorry. Uh, Maya. From account hierarchy standpoint, maybe internally we can discuss. I want to know how this entire setup would then work.

[20:05] Callee
Will get good minutes of meeting notes as well. And action items. Awesome. Okay. Awesome.

[20:05] Callee
Thank you. And there are there are two options for data that we may want to try out. Its not documented. So on that page there are there are two options. One is that if we can, uh, query. Big using an encryption function itself. Right. Or a table value function, we can quickly try that out. If that works, then we are sorted. It doesn't. Right. Like a data cloud. But I doubt it. It's going to work. But this is just one of the options because it's undocumented. So we can't be sure.
