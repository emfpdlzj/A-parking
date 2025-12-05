//프로필 사진 이미지 업로드 담당
import React from 'react'
import basicProfile from '../../assets/icons/basic_profile.jpeg'

function ProfileImageUploader({
                                  imageSrc, //현재 업로드할 이미지. 없으면 기본이미지 사용 (basicProfile)
                                  name, //사용할 이름
                                  onChangeImage, //사용자가 새 파일을 선택했을 때 호출되는 콜백
                                  onClearImage, //사진 삭제시 콜백
                              }) {
    const displaySrc = imageSrc || basicProfile //프로필 이미지가 없으면 basicProfile
    const displayAlt = name || '기본 이름'

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#e5e7eb] overflow-hidden flex items-center justify-center text-[11px] text-slate-500">
                <img
                    src={displaySrc}
                    alt={displayAlt}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-[11px] text-slate-500">
                    프로필 사진
                </span>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#f3f4f6] text-xs text-slate-700 cursor-pointer hover:bg-[#e5e7eb]">
                        이미지 선택
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                onChangeImage(e.target.files?.[0])
                            }
                            className="hidden"
                        />
                    </label>

                    {imageSrc && (
                        <button
                            type="button"
                            onClick={onClearImage}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#f3f4f6] text-xs text-slate-700 cursor-pointer hover:bg-[#e5e7eb]"
                        >
                            사진 삭제
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProfileImageUploader