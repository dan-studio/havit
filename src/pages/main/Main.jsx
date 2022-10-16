import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { resetLayout, setLayout } from "@redux/layout";
import MyProfileCard from "@components/profile/MyProfileCard";
import GroupCard from "@components/cards/GroupCard";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { getAllGroupList } from "@apis/group/group";
import { userApis } from "@apis/auth";
import ChallengeGroupCard from "@components/cards/ChallengeGroupCard";
import { getGroupDetail } from "@apis/group/group";
import { FaRegHandPointLeft } from "react-icons/fa";

const Main = () => {
  const principal = useSelector((state) => state.auth.principal, shallowEqual);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState()
  const [myGroupMembers, setMyGroupMembers] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [myInfo, setMyInfo] = useState("");
  const [nullMsg, setNullMsg] = useState("");
  const [toggleGroup, setToggleGroup] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  useEffect(() => {
    dispatch(setLayout({ isInvert: true }));
    return () => {
      dispatch(resetLayout());
    };
  }, []);
  const [crew, setCrew] = useState();
  useEffect(() => {
      userApis
      .MyProfileCard()
      .then((res) => {
        setMyInfo(res);
      })
      .catch((err) => {
        console.log(err);
      });
    getAllGroupList().then((res) => {
      setCrew(res.data);
    });
    userApis.getMyMembers().then((res) => {
      setMyGroupMembers(res);
      if (res.code === "PARTICIPATION_NOT_FOUND") {
        setNullMsg(res.message);
        return;
      }
      const getId = [...new Set(res.map((group) => group.groupId))];
      getId.map((id) =>
        getGroupDetail(id).then((res) => {
          setGroupList((prev) => [...prev, res.data]);
        })
      );
    });
    userApis.getmyGroup().then((res) => {
      setMyGroups(res.data);
    });
  }, []);
  useEffect(()=>{
    const sse = new EventSource(process.env.REACT_APP_API_HOST+'/api/auth/subscribe')
    const handleStream = (data) => {
      setData(data)
    }
    sse.onmessage=(e)=>{
      handleStream(e.data)
    }
    return ()=>{

    }
  },[])
  const myGroupLists = myGroups?.length;
  //최근 생성된 그룹 4개
  const groups = crew?.slice(0,4)
  const certifies = myInfo?.certifyList?.length
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#5e43ff",
      }}
    >
      <MyProfileCard myInfo={principal} certifies={certifies}/>
      {myGroupLists ? null : (
        <NewMemberDiv>
          <div className="message">
            아래의 빨간 화살표를 클릭하여 그룹페이지로 이동해 주세요!
          </div>
          <NewMemberInnerDiv>
            <FaRegHandPointLeft style={{ fontSize: "40px" }} />
          </NewMemberInnerDiv>
        </NewMemberDiv>
      )}
      <StyledBottomDiv>
        <StyledGroup>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h2>{principal?.nickname}님 이런 그룹은 어떠세요?</h2>
            <IoIosArrowForward
              style={{ fontSize: "20px", color: "#DE4242", cursor: "pointer" }}
              onClick={() => {
                navigate("/group");
              }}
            />
          </div>
        </StyledGroup>
        <StyledGroupPhotoBox>
          {groups?.map((item, idx) => (
            <GroupCard
              {...item}
              imgUrl={item?.imageId}
              key={idx}
              groupId={item.groupId}
              onClick={() => {
                navigate(`/group/${item?.groupId}`);
              }}
            />
          ))}
        </StyledGroupPhotoBox>
        <StyledChallengeTitle>함께 챌린지를 완수해요!</StyledChallengeTitle>
        <StyledChallenge>
          {groupList?.length > 0 ? (
            groupList?.map((group, idx) => (
              <ChallengeGroupCard
                key={idx}
                groupList={groupList}
                {...group}
                toggleGroup={toggleGroup}
                setToggleGroup={setToggleGroup}
                myGroupMembers={myGroupMembers}
                myInfo={myInfo}
              />
            ))
          ) : (
            <StyledNullMsg>{nullMsg}</StyledNullMsg>
          )}
        </StyledChallenge>
        <StyledDragLine></StyledDragLine>
      </StyledBottomDiv>
    </div>
  );
};

export default Main;

const StyledBottomDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 15px 0 30px 0;
  position: relative;
  background-color: #fff;
  border-radius: 30px 30px 0 0;
`;
const StyledDragLine = styled.div`
  position: absolute;
  top: 2vh;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 4px;
  border-radius: 25px;
  background-color: ${({ theme }) => {
    return theme.color.lightgray;
  }};
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 15px 0 30px 0;
  position: relative;
  background-color: #fff;
  border-radius: 30px 30px 0 0;

  & > div {
    margin: 35px 20px 0 20px;
    & > h2 {
      font-weight: 700;
      font-size: 19px;
      margin: 0;
      line-height: 24px;
    }
  }
`;
const StyledGroupPhotoBox = styled.div`
  display: flex;
  width: 100vw;
  height: 12.5rem;
  margin-bottom: 70px;
  overflow-x: scroll;
  overflow-y: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const StyledChallenge = styled.div`
  /* position: absolute; */
  /* top: 35vh; */
  width: 100vw;
  margin: 0 auto;
  overflow-y: scroll;
`;
const StyledChallengeTitle = styled.div`
  font-weight: bold;
  font-size: 20px;
  margin-left: 20px;
`;

const StyledNullMsg = styled.div`
  display: flex;
  margin: 50px;
  justify-content: center;
`;

const NewMemberDiv = styled.div`
  display: flex;
  justify-content: center;
  font-size: 14.5px;
  .message {
    color: white;
    font-weight: bold;
  }
`;
const NewMemberInnerDiv = styled.div`
  position: absolute;
  z-index: 999;
  top: 53vh;
  right: 5vw;
  rotate: -55deg;
  color: #5e43ff;
  animation: vibration 0.3s infinite;
  @keyframes vibration {
    0% {
      transform: rotate(-6deg);
      color: #2cdf3d;
    }
    50% {
      transform: rotate(6deg);
      color: #5e43ff;
    }
    100% {
      transform: rotate(-6deg);
      color: white;
    }
  }
`;