module.exports = async function handler(req,res) {
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 const endpoint=process.env.CLONE_PROVIDER_URL||process.env.VIDEO_PROVIDER_URL,key=process.env.CLONE_PROVIDER_API_KEY||process.env.VIDEO_PROVIDER_API_KEY;
 if(!endpoint||!key)return res.status(503).json({error:"Avatar video is not enabled. Configure CLONE_PROVIDER_URL and CLONE_PROVIDER_API_KEY."});
 const {imageUrl,script,voiceInstructions,consent}=req.body||{};
 if(consent!==true)return res.status(400).json({error:"Explicit permission confirmation is required."});
 if(typeof imageUrl!=="string"||!/^https:\/\//i.test(imageUrl))return res.status(400).json({error:"Provide a valid HTTPS portrait image URL."});
 if(typeof script!=="string"||!script.trim()||script.length>12000)return res.status(400).json({error:"Provide a script or supported audio URL under 12,000 characters."});
 try{const r=await fetch(endpoint,{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({image_url:imageUrl,script:script.trim(),voice_instructions:typeof voiceInstructions==="string"?voiceInstructions.slice(0,1000):undefined,consent_confirmed:true})});const d=await r.json();if(!r.ok)return res.status(r.status).json({error:d.error?.message||d.message||"Avatar provider request failed."});return res.status(200).json({videoUrl:d.video_url||d.output_url||d.url||null,jobId:d.id||d.job_id||null,message:d.message||"Avatar job submitted. Provider polling may be required."});}catch(e){return res.status(502).json({error:"Could not reach the avatar provider."});}
};