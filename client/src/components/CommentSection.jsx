import { Button, Modal, Textarea } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Comment } from "./Comment";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { set } from "mongoose";
export const CommentSection = ({ postId }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [commentMsgSuccess, setCommentMsgSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState('')
  const [commentContent, setCommentContent] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    if (comments.length > 0) return;
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/comment/getPostComments/${postId}`);
        if (res.status !== 200) {
          return;
        }
        if (res.status === 200) {
          setComments(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchComments();
  }, [postId]);

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(`/api/comment/deleteComment/${commentId}`);
      if (res.status !== 200) {
        return;
      }
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
      setCommentContent(null)
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate("/signin");
        return;
      }
      const res = await axios.put(`/api/comment/likeComment/${commentId}`);
      if (res.status === 200) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: res.data.likes,
                  numberOfLikes: res.data.likes.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 369) {
      setCommentError("Comment must be less than 369 characters");
      return;
    }
    setCommentError(null);
    try {
      const res = await axios.post("/api/comment/create", {
        postId,
        content: comment,
        userId: currentUser._id,
      });
      if (res.status === 201) {
        setComment("");
        setCommentError(null);
        setComments([res.data, ...comments]);
        setCommentMsgSuccess("Comment posted!");
        setTimeout(() => {
          setCommentMsgSuccess(null);
        }, 1000);
      }
    } catch (error) {
      setCommentError(error);
    }
  };

  return (
    <div className="w-full mb-6 border border-gray-600 rounded-xl p-3">
      {currentUser && (
        <>
          <div className="flex justify-between mb-4">
            <div className="flex gap-2 items-center">
              <p>Signed in as:</p>
              <Link
                to={`/dashboard?tab=profile`}
                className="flex items-center gap-2"
              >
                <img
                  src={currentUser.profilePic}
                  alt={currentUser.username}
                  className="w-6 h-6 object-cover rounded-full"
                />
                <span className="text-blue-500 font-bold hover:underline">
                  {currentUser.username}
                </span>
              </Link>
            </div>

            {commentError && <p className="text-red-500 ">{commentError}</p>}
            {commentMsgSuccess && (
              <p className="text-green-500 ">{commentMsgSuccess}</p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Write your comment here"
              className="w-full mb-2 resize-none"
              rows={3}
              maxLength={369}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs">
                {369 - comment.length} characters remaining
              </p>
              <Button
                outline
                gradientDuoTone="purpleToBlue"
                type="submit"
                className="self-end"
              >
                Post Comment
              </Button>
            </div>
          </form>
          <hr className="m-6" />
        </>
      )}
      {comments?.length === 0 ? (
        <p className="text-sm my-5">No comments yet</p>
      ) : (
        <div className="flex flex-col h-full">
          {comments?.map((comment) => (
            <Comment
              comment={comment}
              onLike={handleLike}
              key={comment._id}
              handleDeleteComment={(commentId, commentContent) => {
                setShowModal(true),
                  setCommentToDelete(commentId),
                  setCommentContent(commentContent);
              }}
            />
          ))}
        </div>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        dismissible
        size="md"
      >
        <Modal.Header />
        <Modal.Body className="flex items-center justify-center flex-col gap-3 text-justify">
          <HiOutlineExclamationCircle className="text-red-500 text-6xl" />
          <h1 className="text-center text-2xl font-semibold dark:text-white">
            Delete this comment?
          </h1>
          <p className="dark:text-white">{commentContent}</p>
          <div className="flex justify-between gap-5">
            <Button
              color="failure"
              onClick={() => {
                handleDeleteComment(commentToDelete);
                setShowModal(false);
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              gradientDuoTone="greenToBlue"
            >
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};
