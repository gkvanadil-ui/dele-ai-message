const save = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("로그인이 안 되어 있습니다.");

  // upsert 시 'id' 필드가 로그인한 유저의 UUID와 반드시 일치해야 함
  const { error } = await supabase.from('profiles').upsert({ 
    id: user.id, // 이 값이 정책 통과의 핵심입니다.
    user_name: form.user_name,
    character_name: form.character_name,
    system_prompt: form.system_prompt,
    avatar_url: form.avatar_url,
    openai_api_key: form.openai_api_key
  });

  if (error) {
    console.error(error);
    alert("저장 실패: " + error.message);
  } else {
    alert("설정 완료!");
  }
};
