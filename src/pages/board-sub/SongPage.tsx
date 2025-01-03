import { getDownloadUrl, uploadImage } from "@/apis/minio/images";
import {
  createSongForm,
  editSongForm,
  getSongDetail,
  getSongs,
  Song,
} from "@/apis/song/song";
import { BogoSelect } from "@/components/BogoSelect";
import { DateSelect } from "@/components/DateSelect";
import { EditButton } from "@/components/EditButton";
import { MonthSelector } from "@/components/SongDateSelect";
import { SongItemCard } from "@/components/SongItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useGlobalStore } from "@/stores/global.store";
import { Label } from "@radix-ui/react-label";
import { ChevronRight, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

export const SongPage = ({
  kind,
  boardId,
}: {
  kind: boolean;
  boardId: string;
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const now = new Date();
    return `${now.getFullYear().toString()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  });
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [songList, setSongList] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [createDate, setCreateDate] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek >= 4 ? 7 - dayOfWeek : -dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + diff);
    return sunday;
  });

  const [createDate2, setCreateDate2] = useState<Date>(() => new Date());

  // 폼 상태
  const [formData, setFormData] = useState<{
    describe: string;
    songList: Song["songList"];
  }>({
    describe: "",
    songList: Array(4).fill({
      url: "",
      lyricOrder: "",
      imageName: "",
      imageFile: null,
      imageTempUrl: "",
      title: "",
    }),
  });

  const { userInfo, getCanWriteByDescription } = useGlobalStore();

  const handleCreate = () => {
    setIsCreate(true);
    setFormData({
      describe: "",
      songList: Array(4).fill({
        url: "",
        lyricOrder: "",
        imageName: "",
        imageFile: null,
        imageTempUrl: "",
        title: "",
      }),
    });
  };

  const handleEdit = () => {
    if (!selectedSong) return;
    setIsEdit(true);
    setFormData({
      describe: selectedSong.describe,
      songList: selectedSong.songList,
    });
  };

  const handleCancel = () => {
    setIsCreate(false);
    setIsEdit(false);
  };

  const handleSongItemUpdate = (
    index: number,
    updatedItem: Song["songList"][0]
  ) => {
    const newList = [...formData.songList];
    newList[index] = updatedItem;
    setFormData({ ...formData, songList: newList });
  };

  const handleSongItemDelete = (index: number) => {
    setFormData({
      ...formData,
      songList: formData.songList.filter((_, i) => i !== index),
    });
  };

  const handleAddSongItem = () => {
    setFormData({
      ...formData,
      songList: [
        ...formData.songList,
        {
          url: "",
          lyricOrder: "",
          imageName: "",
          imageFile: undefined,
          imageTempUrl: "",
          title: "",
        },
      ],
    });
  };

  const handleSubmit = async () => {
    try {
      const filtered = formData.songList.filter((item) => item.title !== "");
      await Promise.all(
        filtered
          .filter((item) => item.imageUploadUrl && item.imageFile)
          .map((item) =>
            uploadImage(item.imageUploadUrl as string, item.imageFile as File)
          )
      );
      if (isCreate) {
        await createSongForm({
          ...formData,
          songList: filtered,
          singdate: kind ? createDate : createDate2,
          creatorPid: userInfo?.pid as string,
          kind: kind,
        });
        setIsCreate(false);
        fetchLists();
      } else if (isEdit) {
        // selectedSong;
        const data = {
          ...formData,
          id: selectedSong?.id as string,
          songList: filtered,
          singdate: kind ? createDate : createDate2,
          kind: kind,
          updaterPid: userInfo?.pid as string,
          creatorPid: selectedSong?.creatorPid as string,
        };
        await editSongForm(selectedSong?.id as string, data);
        setSelectedSong(data as Song);
        setIsEdit(false);
      }
    } catch {
      console.error("실패");
    }
  };

  const fetchLists = async () => {
    if (!selectedDate) return;
    try {
      const list = await getSongs(kind, selectedDate);
      setSongList(list);
    } catch {
      console.error("list 요청 실패");
      setSongList([]);
    }
  };

  const handleCardClick = async (id: string) => {
    const song = await getSongDetail(id);
    const songListWithUrls = await Promise.all(
      song.songList.map(async (item) => ({
        ...item,
        imageTempUrl: await getDownloadUrl(item.imageName),
      }))
    );
    setSelectedSong({
      ...song,
      songList: songListWithUrls,
    });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  useEffect(() => {
    fetchLists();
    setIsCreate(false);
    setIsEdit(false);
  }, [selectedDate, kind]);

  const writeRight = getCanWriteByDescription(boardId);

  // 작성/수정 폼
  if (isCreate || isEdit) {
    return (
      <div className="page-wrapper">
        <div className="h-9 flex items-center mb-4">
          <Label className="text-xl font-bold">
            {isEdit
              ? `${formatDate(selectedSong!.singdate)} ${
                  kind ? "찬양" : "특송"
                } 콘티`
              : `${formatDate(
                  kind ? createDate : createDate2
                )} 찬양 콘티 작성하기`}
          </Label>
        </div>
        <div className="page-body">
          <div className="mb-4">
            <Label className="mb-2 block">설명</Label>
            <textarea
              value={formData.describe}
              onChange={(e) =>
                setFormData({ ...formData, describe: e.target.value })
              }
              className="w-full min-h-20 p-2 border rounded-md"
            />
          </div>
          <div className="grid gap-4">
            {formData.songList.map((song, index) => (
              <SongItemCard
                key={index}
                item={song}
                displayOrder={index + 1} // index 대신 displayOrder prop을 전달
                onUpdate={handleSongItemUpdate}
                onDelete={handleSongItemDelete}
                canDelete={formData.songList.length > 1}
                pid={userInfo?.pid as string}
              />
            ))}
          </div>
          <button
            onClick={handleAddSongItem}
            className="w-full justify-center mt-4 flex items-center text-blue-500 hover:text-blue-700"
          >
            <PlusCircle className="mr-2" />
            찬양 추가
          </button>
        </div>
        <div className="flex justify-between items-center mt-4">
          {!isEdit &&
            (kind ? (
              <BogoSelect
                selectedDate={createDate}
                setSelectedDate={setCreateDate}
              />
            ) : (
              <DateSelect
                selectedDate={createDate2}
                setSelectedDate={setCreateDate2}
              />
            ))}
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="destructive" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSubmit}>저장</Button>
          </div>
        </div>
      </div>
    );
  }

  // 상세 보기
  if (selectedSong) {
    return (
      <div className="page-wrapper">
        <div className="h-9 flex items-center mb-4">
          <Label className="text-xl  font-bold">
            {formatDate(`${selectedSong.singdate}`)} {kind ? "찬양" : "특송"}{" "}
            콘티
          </Label>
        </div>
        <div className="page-body">
          <div className="mb-1">
            <textarea
              value={selectedSong.describe}
              readOnly
              className="w-full min-h-20 p-2 border rounded-md"
            />
          </div>
          <div className="grid gap-4">
            {selectedSong.songList.map((song, index) => (
              <SongItemCard
                key={song.title}
                item={song}
                displayOrder={index + 1}
                isReadOnly
                pid={userInfo?.pid as string}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-between mt-4">
          <Button
            variant="ghost"
            className="flex justify-start items-center gap-2"
            onClick={() => setSelectedSong(null)}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            리스트로 돌아가기
          </Button>
          {writeRight && <EditButton onClick={handleEdit}>수정</EditButton>}
        </div>
      </div>
    );
  }
  // 리스트 보기
  return (
    <div className="page-wrapper">
      <div className="h-9 flex items-center mb-4">
        <Label className="text-xl font-bold">
          {kind ? "찬양" : "특송"} 콘티
        </Label>
      </div>
      <div className="page-body">
        <div className="space-y-2">
          {songList.map((song) => (
            <Card
              key={song.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCardClick(song.id)}
            >
              <CardHeader className="p-4">
                <div className="">
                  {formatDate(`${song.singdate}`)} 찬양 콘티
                </div>
                <div className="flex justify-end items-center">
                  <div className="text-sm text-gray-500">
                    작성자: {song.creatorName}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <MonthSelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        {userInfo?.pid && writeRight && (
          <Button onClick={handleCreate}>작성하기</Button>
        )}
      </div>
    </div>
  );
};
